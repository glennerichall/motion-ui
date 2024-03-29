import React, {useState, useEffect, Fragment} from "react";
import classNames from "classnames";
import {fetch} from '../js/fetch';
import DateTime from "./DateTime";
import startOfTomorrow from 'date-fns/startOfTomorrow';
import startOfDay from 'date-fns/startOfDay';
import {pushView} from "./Frame";
import {supportsIntersectionObserver} from "../js/browser-check";
import EventData from "./EventData";
import {getNotifications} from "../js/notifications";
import {subscribe, unsubscribe} from "../js/pubsub";

let Events = props => null;
if (supportsIntersectionObserver) {
    (async () => {
        Events = (await import( "./Events")).default;
    })();
}

export default props => {
    const notifications = getNotifications();

    const {events, eventStatus} = props;
    const [count, setCount] = useState({
        all: {total: 0},
        today: {total: 0},
        last: null
    });

    const now = () => startOfDay(new Date()).getTime();

    const [day, setDay] = useState(now());

    const update = async () => {
        try {
            const all = fetch(events.count.all);
            const today = fetch(events.count.today);
            const last = fetch(events.last);

            setCount({
                all: await all,
                today: await today,
                last: await last
            });

            setDay(now());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const now = new Date();
        const tomorrow = startOfTomorrow();
        const delay = tomorrow - now;
        const timeout = setTimeout(update, delay + 10 * 1000)  /* add 10 seconds */;
        return () => clearTimeout(timeout);
    }, [day]);

    useEffect(() => {
        const event = subscribe(
            notifications.events.eventsDeleted,
            ({camera, events}) => {
                if(camera == props.camera) {
                    update();
                }
            });

        return () => unsubscribe(event);
    }, [notifications]);

    useEffect(() => {
        // a react effect must return a function or undefined
        update();
    }, [events, eventStatus]);

    const {all, today, last} = count;
    return (
        <>
            <div className="event-status"/>
            <div className={classNames("events", {'has-events': all.total > 0})}>
                <div className="event-count">
                    <div className="all"
                         onClick={() => supportsIntersectionObserver ?
                             pushView(<Events calendar={events.calendar}
                                              camera={props.camera}
                                              name='all'/>) :
                             null}>
                        {all && all.total}
                    </div>
                    <div className='today'
                         onClick={() => supportsIntersectionObserver ?
                             pushView(<Events src={events.today}
                                              camera={props.camera}
                                              name='today'/>) :
                             null}>
                        {today?.total > 0 ? today.total : '-'}
                    </div>
                </div>
                <DateTime lastEvent={last}
                          onClick={() => supportsIntersectionObserver ?
                              pushView(<EventData event={last}/>) :
                              null}/>
            </div>
        </>
    );
};

