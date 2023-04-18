import database from "./src/database/index.js";

(async () => {
        await database.init();
        await (await import('./src/index.js')).default();
    }
)();
