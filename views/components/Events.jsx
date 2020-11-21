import React, {useState, useEffect, Fragment} from "react";
import classNames from "classnames";
import {fetch} from '../js/fetch';
import {socket} from "../js/socket";
import DateTime from "./DateTime";

export default props => {
    const {events, eventStatus} = props;

    const [count, setCount] = useState({
        all: {total: 0},
        today: {total: 0},
        last: null
    });

    useEffect(() => {
        (async () => {
            try {
                const all = fetch(events.all);
                const today = fetch(events.today);
                const last = fetch(events.last);

                setCount({
                    all: await all,
                    today: await today,
                    last: await last
                });

            } catch (e) {
                console.error(e);
            }
        })();
    }, [events, eventStatus]);

    const {all, today, last} = count;
    return (
        <Fragment>
            <div className="event-status"/>
            <div className={classNames("events", {'has-events': !!all.total})}>

                <div className="event-count">
                    <div className="all">{all && all.total}</div>
                    <div className='today'>{today && today.total}</div>
                </div>
                <DateTime lastEvent={last}/>
            </div>
        </Fragment>
    );
};

