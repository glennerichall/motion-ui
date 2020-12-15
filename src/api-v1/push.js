const express = require('express');
const webpush = require('web-push');
const database = require('../database');
const fs = require('fs');
const crypto = require("crypto");

let vapidKeys;

try {
    vapidKeys = JSON.parse(fs.readFileSync('./vapidKeys.json').toString());
} catch (e) {
    // VAPID keys should only be generated only once.
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync('./vapidKeys.json', JSON.stringify(vapidKeys));
}

webpush.setVapidDetails(
    'mailto:web-push-book@gauntface.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

let createSubscriptionSql = `
    insert into push_subscriptions
        (subscription, time, key, vapikey)
    values (@subscription, now(), @key, '${vapidKeys.publicKey}') returning (subscription, time, key);
`;

let querySubscriptionsSql = `
    select *
    from push_subscriptions
    where vapikey = '${vapidKeys.publicKey}';
`;

let querySubscriptionSql = `
    select *
    from push_subscriptions
    where key = @key and vapikey='${vapidKeys.publicKey}';
`;

let deleteSubscriptionSql = `
    delete
    from push_subscriptions
    where key = @key and vapikey='${vapidKeys.publicKey}'
    returning (subscription, time, key);
`;

let createSubscriptionStmt = database.prepare(createSubscriptionSql);
let querySubscriptionsStmt = database.prepare(querySubscriptionsSql);
let querySubscriptionStmt = database.prepare(querySubscriptionSql);
let deleteSubscriptionStmt = database.prepare(deleteSubscriptionSql);

function createHash(data) {
    const key = crypto
        .createHash("MD5")
        .update(JSON.stringify(data))
        .digest('hex');
    return key;
}

module.exports = express.Router()
    .post('/subscription', async (req, res) => {
        const subscription = req.body;
        const key = createHash(subscription);
        if (subscription?.endpoint) {
            const registered = (await createSubscriptionStmt.run({subscription, key}))[0];
            res.send(registered);
        } else {
            res.status(400);
            res.send({
                error: {
                    id: 'no-endpoint',
                    message: 'Subscription must have an endpoint.'
                }
            });
        }
    })

    .delete('/subscription', async (req, res) => {
        const subscription = req.body;
        const key = createHash(subscription);
        if (subscription?.endpoint) {
            const registered = (await deleteSubscriptionStmt.run({key}))[0];
            res.send(registered);
        } else {
            res.status(400);
            res.send({
                error: {
                    id: 'no-endpoint',
                    message: 'Subscription must have an endpoint.'
                }
            });
        }
    })


    .post('/subscription/validation', async (req, res) => {
        let subscription = req.body;
        const key = createHash(subscription);
        const registered_subscription = await querySubscriptionStmt.get({key});
        try {
            await webpush.sendNotification(registered_subscription?.subscription,
                'test-validity',
                {TTL: 60});
            res.send({validity: true});
        } catch (e) {
            res.send({validity: false});
        }
    })

    .get('/pubkey', (req, res) => {
        res.send({
            publicKey: vapidKeys.publicKey
        });
    });

module.exports.publish = async (event, message) => {
    const data = JSON.stringify({
        event,
        ...message
    });
    const subscriptions = await querySubscriptionsStmt.all();
    for (let {subscription, key} of subscriptions) {
        try {
            const res = await webpush.sendNotification
            (subscription, data, {TTL: 60});
            console.log(res);
        } catch (e) {
            console.error('Failed to send push', e);
            deleteSubscriptionStmt({key});
        }
    }
};