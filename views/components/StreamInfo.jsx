import React, {useState, useEffect} from "react";
import classNames from "classnames";
import {fetch} from '../js/fetch';
import {socket} from "../js/socket";

const DateTime = (props) => {
    const {lastEvent} = props;
    if (lastEvent && lastEvent.begin) {
        const [day, time] = lastEvent.begin.split(' ');
        const [hour, minute] = time.split(':');
        const hm = `${hour}:${minute}`;
        return (
            <div className={classNames("last", 'has-last')}>
                <div>
                    <div className="day">{day}</div>
                    <div className="hour">{hm}</div>
                </div>
            </div>
        )
    }
    return (
        <div className="last"/>
    );
};

export default props => {
    const {events, name, id, notifications} = props;

    const [count, setCount] = useState({
        all: {total: 0},
        today: {total: 0},
        last: null
    });

    const [eventStarted, setEventStarted] = useState(false);

    useEffect(() => {
        const {eventStart, eventEnd} = notifications;
        socket.on(eventStart, event => {
            if (event.camera === id) {
                setEventStarted(true);
            }
        });

        socket.on(eventEnd, event => {
            if (event.camera === id) {
                setEventStarted(false);
            }
        });

        (async () => {
            const {status} = (await fetch(events.status));
            console.log(status);
            setEventStarted(status === 'recording');
        })();

        return () => {
            socket.off(eventStart);
            socket.off(eventEnd);
        }
    }, [notifications]);

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
    }, [events, eventStarted]);

    const {all, today, last} = count;
    return (
        <div className="header">
            <div className={classNames("events", {'has-events': !!all.total})}>
                <div className="all">{all && all.total}</div>
                <div className='today'>{today && today.total}</div>
            </div>

            <div className="name">{name}</div>
            <DateTime lastEvent={last}/>
            <div className={classNames("heart-beat", {eventStarted})}/>
        </div>
    );
};

