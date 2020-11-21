import React, {useState, useEffect} from "react";
import classNames from "classnames";
import {socket} from "../js/socket";
import {fetch} from "../js/fetch";
import Events from "./Events";
import {acquireToken, releaseToken, hasToken} from "../js/token";

export default props => {

    const {id, status, url, events, name, notifications} = props.stream;

    const [eventStatus, setEventStatus] = useState('idle');
    const [token, setToken] = useState({});

    useEffect(() => {
        if (eventStatus === 'idle') {
            releaseToken(token);
        } else {
            acquireToken(setToken);
        }
    }, [eventStatus]);

    useEffect(() => {
        const {eventStart, eventEnd} = notifications;
        socket.on(eventStart, event => {
            if (event.camera === id) {
                setEventStatus('recording');
            }
        });

        socket.on(eventEnd, event => {
            if (event.camera === id) {
                setEventStatus('idle');
            }
        });

        (async () => {
            const {status} = (await fetch(events.status));
            setEventStatus(status);
        })();

        return () => {
            socket.off(eventStart);
            socket.off(eventEnd);
        }
    }, [notifications]);

    return (
        <div id={'cam-' + id}
             className={classNames("camera", status, eventStatus, {'has-last-event': hasToken(token)})}>
            <div className="header">
                <Events events={events} eventStatus={eventStatus}/>
                <div className="name">{name}</div>
            </div>
            <img src={url} draggable="false"/>
        </div>
    );
}
