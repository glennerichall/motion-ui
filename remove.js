(async () => {
    const {run} = await import('./src/events/remove.js');
    if (process.env.TIMEOUT) {
        setTimeout(async () => {
            console.log('started remove cron');
            await run();
            console.log('done remove cron');
        }, Number.parseInt(process.env.TIMEOUT))
    } else {
        await run();
    }
})();