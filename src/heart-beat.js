const {io} = require('./server');
const Provider = require('./provider');

let status = {}

async function getStatus() {
    const cameras = await new Provider().getCameras();
    return cameras.map(camera => camera.toStatus())
        .reduce(async (status, camera) => {
            status = await status;
            camera = await camera;
            status[camera.id] = camera.status;
            return status;
        }, {});
}

(async () => {
    status = await getStatus();
})();

// heartbeat
setInterval(async () => {
    const current = await getStatus();
    for (let camera in status) {
        if (status[camera] !== current[camera]) {
            io.emit('motion-status-changed', {
                ...current[camera],
                previous: status[camera]
            });
        }
    }
}, 1000);