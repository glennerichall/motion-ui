module.exports = {
    apps: [
        {
            script: 'index.js',
            watch: 'true',
            name: 'motion-ui',
            env: {
                env_production: {
                    NODE_ENV: 'production',
                    API_HOST: 'http://192.168.1.110:3000',
                    STREAM_HOST: 'https://zm.velor.ca'
                }
            }
        }
    ],

    deploy: {
        production: {
            user: 'glenn',
            host: '192.168.1.110',
            ref: 'origin/master',
            repo: 'git@github.com:glennerichall/motion-ui.git',
            path: '/home/glenn/motion-ui',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
        }
    }
};
