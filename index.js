const events = require('./src/events');

(async () => {
        await events.init();
        await require('./src')();
    }
)();
