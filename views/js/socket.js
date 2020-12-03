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
    if (socket != null) return socket;
    if (isValidBrowser) {
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

