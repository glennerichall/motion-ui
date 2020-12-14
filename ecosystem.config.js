module.exports = {
    apps: [
        {
            name: 'motion-ui',
            script: './index.js',
            env_production: {
                NODE_ENV: 'production',
                API_HOST: 'http://localhost:8080',
                STREAM_HOST: 'http://192.168.1.110:8081'
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
