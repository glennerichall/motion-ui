import React, {useState, useEffect, Fragment} from "react";
import classNames from "classnames";
import {fetch} from '../js/fetch';
import {socket} from "../js/socket";
import DateTime from "./DateTime";
import startOfTomorrow from 'date-fns/startOfTomorrow';
import startOfDay from 'date-fns/startOfDay';

export default props => {
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
            const last = fetch(events.count.last);

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
        const timeout = setTimeout(update, delay) + 10 * 1000 /* add 10 seconds */;
        return () => clearTimeout(timeout);
    }, [day]);

    useEffect(() => {
        // a react effect must return a function or undefined
        update();
    }, [events, eventStatus]);

    const {all, today, last} = count;
    return (
        <Fragment>
            <div className="event-status"/>
            <div className={classNames("events", {'has-events': !!all.total})}>

                <div className="event-count">
                    <div className="all">{all && all.total}</div>
                    <div className='today'>{(today && today.total) || '-'}</div>
                </div>
                <DateTime lastEvent={last}/>
            </div>
        </Fragment>
    );
};
