const database = require('../events/events');
const fs = require('fs').promises;
const {resolve} = require('path');
const Provider = require('../provider');
const deleteEmpty = require('delete-empty');

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

(async () => {
    await database.init();
    let data = await database.getBuilder().data().fetch();

    // find orphans rows ie that has no file associated
    const orphans = [];
    const promises = data.map(async datum => {
        try {
            return await fs.access(datum.filename);
        } catch (e) {
            orphans.push(datum);
        }
    });
    await Promise.all(promises);

    const ids = orphans.map(datum => datum.id);

    // remove those orphans from the database
    const cleanDataSql = `
        delete
        from events
        where id in (${ids.join(',')});
    `;

    // then remove any events that has no data associated
    const cleanEventsSql = `
        delete
        from event_logs
        where (camera || event) not in (
            select distinct (camera || event)
            from events
        );
    `;

    const countData = (await database.prepare(cleanDataSql).run()).changes;
    const countEvents = (await database.prepare(cleanEventsSql).run()).changes;

    // get cameras
    const cameras = (await new Provider().getCameras())
        .map(camera => camera.getId());

    // fetch data to seek files that are not in the database
    const queryDataSql = `
        select filename
        from events
    `;
    const files = (await database.prepare(queryDataSql).all())
        .map(datum => datum.filename);

    let countFiles = 0;
    const targetDirs = [];
    for (let camera of cameras) {

        // get files of target dir of camera
        const targetDir = await new Provider({params: {camera}}).getCamera().getTargetDir();
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

    // remove all empty directories remaining
    let countEmpty = 0;
    try {
        const deleted = targetDirs.map(targetDir => deleteEmpty(targetDir));
        countEmpty = (await Promise.all(deleted)).length;
    } catch (e) { }

    database.close();

    if (process.send) {
        process.send({countData, countEvents, countFiles, countEmpty});
    } else {
        console.log(`removed ${countData} orphans from event data`);
        console.log(`removed ${countEvents} events with no data`);
        console.log(`removed ${countFiles} files with no events`);
        console.log(`removed ${countEmpty} empty director${countEmpty <=1 ? 'y' : 'ies'}`);
    }
})();

