import database from "../database/index.js";
import {promises as fs} from "fs";

import url from "url";

const {
    drive,
} = OsUtils;

import {run as runClean} from './clean.js';
import OsUtils from "node-os-utils";


async function deleteEvents() {
    const queryByDateSql = `
        select events.*
        from event_logs
                 inner join events on event_logs.camera = events.camera and
                                      event_logs.event = events.event
        where removed = false
          and locked = false
          and done is not null
        order by time;
    `;

    const files = await database.prepare(queryByDateSql).all();

    let size = 0;
    let i = 0;
    let driveUsage = await drive.info();

    while (driveUsage.usedPercentage >= 80) {
        const file = files[i];
        const stats = await fs.stat(file.filename);
        const fileSizeInBytes = stats.size;
        size += fileSizeInBytes;
        await fs.unlink(file.filename);
        driveUsage = await drive.info();
        i++;
    }

    return {
        removedEvents: i,
        size
    };
}

async function getUsage() {
    const driveUsage = await drive.info();
    return Number.parseFloat(driveUsage.usedPercentage);
}

export async function run() {
    const usage = await getUsage();

    if (usage >= 90) {
        await runClean();

        await database.init();

        const {
            removedEvents,
            size
        } = await deleteEvents();

        await database.close();

        if (process.send) {
            process.send({removedEvents, size});
        } else {
            console.log(`deleted ${removedEvents} events and cleaned ${size} bytes`);
        }
    }
}

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
    (async () => {
        await run();
    })();
}
