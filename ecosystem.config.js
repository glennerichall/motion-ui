module.exports = {
    apps: [
        {
            name: 'motion-ui',
            script: './index.js',
            env_production: {
                NODE_ENV: 'production',
                //PORT: 3000,
                //MOTION_HOST: 'http://localhost:8080'
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
