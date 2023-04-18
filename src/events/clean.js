import database from "../database/index.js";
import {promises as fs} from "fs";
import {resolve} from "path";

import Provider from "../motion/provider.js";
import deleteEmpty from "delete-empty";
import path from "path";

const remap = process.env.TARGET_DIR ?? '';

async function* getFiles(dir) {
    const dirents = await fs.readdir(dir, {withFileTypes: true});
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

/**
 * Remove all events marked as removed in the database.
 * Also remove files associated with these events.
 * @returns {Promise<{removedFiles: *, removedEvents: *}>}
 */
async function deleteEvents() {
    const queryRemovedSql = `
        select filename
        from events
                 inner join event_logs on
                events.camera = event_logs.camera and
                events.event = event_logs.event
        where event_logs.removed = true;
    `;

    const files = await database.prepare(queryRemovedSql).all();

    const unlinking = files?.map(async filename => {
        try {
            // https://nodejs.org/api/fs.html#fs_fs_stat_path_options_callback
            // Using fs.stat() to check for the existence of a file before
            // calling fs.open(), fs.readFile() or fs.writeFile() is not recommended.
            // Instead, user code should open/read/write the file directly and handle
            // the error raised if the file is not available.
            return await fs.unlink(filename);
        } catch (err) {}
        return Promise.resolve();
    });
    await Promise.all(unlinking);

    const deleteRemovedSql = `
        delete
        from event_logs
        where removed = true returning *;
    `;

    let removedEvents = await database.prepare(deleteRemovedSql).run();

    return {
        removedEvents: removedEvents.length,
        removedFiles: files.length
    };
}

/**
 * Remove events from database where event has no associated files.
 * @returns {Promise<{countData: (*|*|number), countEvents: (*|*)}>}
 */
async function removeOrphans() {
    let data = await database.getBuilder().data().fetch();

    // find orphans rows ie that has no file associated
    const orphans = [];
    const promises = data.map(async datum => {
        try {
            return await fs.stat(path.join(remap, datum.filename));
        } catch (e) {
            orphans.push(datum);
        }
    });
    await Promise.all(promises);

    const ids = orphans.map(datum => datum.id);

    // if no datum is found, use -1 so query won't be ill-formed
    if (ids.length === 0) ids.push(-1);

    // remove those orphans from the database
    const cleanDataSql = `
        delete
        from events
        where id in (${ids.join(',')})
        or (camera || event) not in (
            select distinct (camera || event)
            from event_logs)
        returning *;
    `;

    // then remove any events that has no data associated
    const cleanEventsSql = `
        delete
        from event_logs
        where (camera || event) not in (
            select distinct (camera || event)
            from events
        ) returning *;
    `;

    let countData = await database.prepare(cleanDataSql).run() || 0;
    let countEvents = await database.prepare(cleanEventsSql).run();

    countData = countData?.length;
    countEvents = countEvents?.length;

    return {
        countData,
        countEvents
    };
}

/**
 * Clean directories where files has been removed and no more files remains.
 * @param targetDirs
 * @returns {Promise<number>}
 */
async function removeEmptyDirectories(targetDirs) {
    // remove all empty directories remaining
    let countEmpty = 0;
    try {
        const deleted = targetDirs.map(targetDir => deleteEmpty(targetDir));
        countEmpty = (await Promise.all(deleted))
            .reduce((res, cur) => res + cur.length, 0);
    } catch (e) { }

    try {
        const created = targetDirs.map(targetDir => fs.mkdir(path.join(remap, targetDir)).catch(e => {}));
        await Promise.all(created);
    } catch (e) {}

    return countEmpty;
}

/**
 * Remove files that has not events associated.
 * @returns {Promise<{countEmpty: number, countFiles: number}>}
 */
async function removeFiles() {
    // get cameras
    const cameras = (await new Provider().getCameras())
        .map(camera => camera.getId());

    // fetch data to seek files that are not in the database
    const queryDataSql = `
        select filename
        from events
    `;
    const files = (await database.prepare(queryDataSql).all())
        .map(datum => path.join(remap, datum.filename));

    let countFiles = 0;
    const targetDirs = [];
    for (let camera of cameras) {

        // get files of target dir of camera
        const targetDir = path.join(remap, await new Provider({params: {camera}}).getCamera().getTargetDir());

        if (!targetDirs.includes(targetDir)) {
            targetDirs.push(targetDir);
            try {
                for await(const file of getFiles(targetDir)) {
                    if (!files.includes(file)) {
                        try {
                            countFiles++;
                            await fs.unlink(file);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            } catch (e) {}
        }
    }

    const countEmpty = await removeEmptyDirectories(targetDirs);

    return {
        countEmpty,
        countFiles
    };
}

(async () => {
    await database.init();

    const {
        removedEvents,
        removedFiles
    } = await deleteEvents();

    const {
        countData,
        countEvents
    } = await removeOrphans();

    const {
        countEmpty,
        countFiles
    } = await removeFiles();

    database.close();

    if (process.send) {
        process.send({removedEvents, removedFiles, countData, countEvents, countFiles, countEmpty});
    } else {
        console.log(`removed ${removedEvents} events`);
        console.log(`removed ${removedFiles} files`);
        console.log(`removed ${countData} orphans from event data`);
        console.log(`removed ${countEvents} events with no data`);
        console.log(`removed ${countFiles} files with no events`);
        console.log(`removed ${countEmpty} empty director${countEmpty <= 1 ? 'y' : 'ies'}`);
    }
})();

