module.exports = {
    apps: [
        {
            name: 'motion-ui',
            script: './index.js',
            env_production: {
                NODE_ENV: 'production'
            }
        },
        {
            name: 'motion-clean',
            script: './clean.js',
            env_production: {
                NODE_ENV: 'production',
                TIMEOUT: 24 * 60 * 60 * 1000 // every 24 hours
            }
        },
        {
            name: 'motion-remove',
            script: './remove.js',
            env_production: {
                NODE_ENV: 'production',
                TIMEOUT: 24 * 60 * 60 * 1000 // every 24 hours
            }
        }
    ]
};
