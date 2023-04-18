import {
    internalIpV4,
} from "internal-ip";

export default async function (req, res, next) {
    let requestIP = req.ip
        || req.connection.remoteAddress
        || req.socket.remoteAddress
        || req.connection.socket.remoteAddress;

    const permittedIp = process.env.IpCanPost;

    const localIp = await internalIpV4();

    const whitelist = [permittedIp, localIp, '127.0.0.1', '::ffff:127.0.0.1', '::1'];

    const authorized = whitelist.reduce((prev, val) => prev || val === requestIP, false);

    if (authorized) {
        next();
    } else {
        res.status(401).send();
    }
}