module.exports = {
    apps: [
        {
            script: 'index.js',
            watch: 'true',
            name: 'motion-ui',
            env_production: {
                NODE_ENV: 'production',
                API_HOST: 'http://localhost:8080',
                STREAM_HOST: 'http://192.168.1.110:8081',
                EVENTS: '/home/glenn/motion-ui/motion.db'
            }
        }
    ],

    deploy: {
        production: {
            user: 'glenn',
            host: '192.168.1.110',
            ref: 'origin/master',
            repo: 'https://github.com/glennerichall/motion-ui.git',
            path: '/home/glenn/motion-ui',
            'post-deploy': 'npm install && PATH=~/.npm-global/bin:$PATH pm2 reload ecosystem.config.js --env production',
        }
    }
};
