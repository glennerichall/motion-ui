module.exports = {
    apps: [
        {
            name: 'motion-ui',
            script: './index.js',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                API_HOST: 'http://localhost:8080',
                STREAM_HOST: 'http://localhost:8081'
            }
        },
        // {
        //     name: 'motion-cron',
        //     env_production: {
        //         NODE_ENV: 'production',
        //     }
        // }
    ]
};
