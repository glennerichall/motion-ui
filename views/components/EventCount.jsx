import React, {useState, useEffect, Fragment} from "react";
import classNames from "classnames";
import {fetch} from '../js/fetch';
import DateTime from "./DateTime";
import startOfTomorrow from 'date-fns/startOfTomorrow';
import startOfDay from 'date-fns/startOfDay';
import {pushView} from "./Frame";
import Events from "./Events";

import Bowser from "bowser";

const browser = Bowser.getParser(window.navigator.userAgent);

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
                    <div className="all"
                         onClick={() => isValidBrowser ?
                             pushView(<Events src={events.all} name='all'/>) :
                             null}>
                        {all && all.total}
                    </div>
                    <div className='today'
                         onClick={() => isValidBrowser ?
                             pushView(<Events src={events.today} name='today'/>) :
                             null}>
                        {(today && today.total) || '-'}
                    </div>
                </div>
                <DateTime lastEvent={last}/>
            </div>
        </Fragment>
    );
};

