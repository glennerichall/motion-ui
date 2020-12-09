import {supportsSockets} from "./browser-check";

let socket = null;
export async function initSocket() {
    if (socket != null) return socket;
    if (supportsSockets) {
        console.log('Using websocket');
        socket = (await import('./socket-io')).socket;
    } else {
        console.log('Using polling');
        socket = (await import ('./socket-polling')).socket;
    }
    return socket;
}

export function getSocket() {
    return socket;
}

