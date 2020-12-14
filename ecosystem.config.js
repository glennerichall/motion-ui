module.exports = {
    apps: [
        {
            script: 'index.jsx',
            watch: 'true',
            name: 'motion-ui',
            env_production: {
                NODE_ENV: 'production',
                API_HOST: 'http://localhost:8080',
                STREAM_HOST: 'http://192.168.1.110:8081'
            }
        }
    ],

    deploy: {
        production: {
            user: 'glenn',
            host: '192.168.1.110',
            ref: 'origin/master',
            repo: 'git@scm.velor.ca:glennerichall/motion-ui.git',
            path: '/home/motion/motion-ui',
            'post-deploy': 'npm install && PATH=~/.npm-global/bin:$PATH pm2 reload ecosystem.config.js --env production',
        }
    }
};
