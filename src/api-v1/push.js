const express = require('express');
const webpush = require('web-push');
const database = require('../database');
const fs = require('fs');

let vapidKeys;
let createSubscriptionSql = `
    insert into push_subscriptions
        (subscription, time)
    values (@subscription, now());
`;
let querySubscriptionsSql = `
    select * from push_subscriptions;
`;
let createSubscriptionStmt = database.prepare(createSubscriptionSql);
let querySubscriptionsStmt = database.prepare(querySubscriptionsSql);

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

module.exports = express.Router()
    .post('/subscription', async (req, res) => {
        const subscription = req.body;

        if (subscription?.endpoint) {
            await createSubscriptionStmt.run({subscription});
            res.send(subscription);
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
    for (let {subscription} of subscriptions) {
        webpush.sendNotification(subscription, data);
    }
};