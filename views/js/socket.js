import Bowser from "bowser";

const browser = Bowser.getParser(window.navigator.userAgent);
console.log(browser.getBrowser());

const isValidBrowser = browser.satisfies({
    chrome: ">=16",
    firefox: ">=11",
    opera: ">=12.1",
    edge: ">=12",
    mobile: {
        safari: '>=6',
        'android browser': '>=4.4'
    },
});

let socket = null;

export async function initSocket() {
    if (isValidBrowser) {
        console.log('Using websocket');
        const io = await import ('socket.io-client');
        socket = io();
        socket.on('connect', () => {
            console.log('Connected to websocket');
        });
    } else {
        console.log('Using polling');
        socket = {
            on() { },
            off() { },
            connected: true
        }
    }
    return socket;
}

export function getSocket() {
    return socket;
}