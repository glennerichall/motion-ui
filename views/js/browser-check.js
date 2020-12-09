import Bowser from "bowser";

const browser = Bowser.getParser(window.navigator.userAgent);
console.log(browser.getBrowser());

export const supportsIntersectionObserver = browser.satisfies({
    chrome: ">=58",
    firefox: ">=55",
    opera: ">=12.1",
    safari: ">=45",
    edge: ">=16",
    mobile: {
        safari: '>=12.2',
        'android browser': '>=4.4'
    },
});

export const supportsSockets  = browser.satisfies({
    chrome: ">=16",
    firefox: ">=11",
    opera: ">=12.1",
    edge: ">=12",
    mobile: {
        safari: '>=6',
        'android browser': '>=4.4'
    },
});