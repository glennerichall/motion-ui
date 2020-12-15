import {post, fetch} from './fetch';

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function postSubscription(subscription) {
    return await post('v1/push/subscription/', subscription);
}

async function validateSubscription(subscription) {
    return await post('v1/push/subscription/validation', subscription);
}

if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
    console.log('Service Worker and Push is supported');

    Notification.requestPermission().then(function (result) {
        if (result === 'granted') {
        }
    });

    (async () => {
        try {
            const swReg = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker is registered');

            let subscription = await swReg.pushManager.getSubscription();
            console.log(JSON.stringify(subscription))
            if(subscription && !(await validateSubscription(subscription)).validity) {
                await subscription.unsubscribe();
                subscription = null;
            }

            if (subscription === null) {
                const appPubKey = await fetch('/v1/push/pubkey');
                // subscribe user
                const applicationServerKey = urlB64ToUint8Array(appPubKey.publicKey);
                subscription = await swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
                await postSubscription(subscription);
            }
        } catch (error) {
            console.error(error);
        }
    })();

} else {
    console.warn('Push messaging is not supported');
}