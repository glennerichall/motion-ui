import Builder from "../events/builder.js";

import path, {dirname} from "path";
import {fileURLToPath} from "url";
import fs from "fs";

let configs = process.env.DATABASE_CONFIGS ?? 'pgconfig.json';
const __dirname = dirname(fileURLToPath(import.meta.url));
if (!path.isAbsolute(configs)) {
    configs = path.join(__dirname, '../..', configs);
}

import Database from "./database-postgres.js";

const databaseConfigs = JSON.parse(fs.readFileSync(configs).toString());

class Index extends Database {
    constructor() {
        super(databaseConfigs.options);
    }

    getBuilder() {
        return new Builder(this);
    }
}

export default new Index();