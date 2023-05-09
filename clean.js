(async () => {
    const {run} = await import('./src/events/clean.js');
    if (process.env.TIMEOUT) {
        setTimeout(async () => {
            console.log('started clean cron');
            await run();
            console.log('done clean cron');
        }, Number.parseInt(process.env.TIMEOUT))
    } else {
        await run();
    }
})();