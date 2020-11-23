import React, {Fragment, useState, useEffect, useRef} from "react";
import classNames from "classnames";
import {socket} from "../js/socket";
import {fetch} from "../js/fetch";
import EventCount from "./EventCount";
import {acquireToken, releaseToken, hasToken} from "../js/token";

export default props => {

    const {id, status, url, events, name, notifications} = props.stream;

    const [eventStatus, setEventStatus] = useState('idle');
    const [token, setToken] = useState({});
    const camRef = useRef(null);

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
        <Fragment>
            <div id={'cam-' + id}
                 ref={camRef}
                 onTransitionEnd={() => { camRef.current.style.transition = null;}}
                 className={classNames("camera", status, eventStatus, {'fullscreen': hasToken(token)})}>
                <div className="header">
                    <EventCount events={events} eventStatus={eventStatus}/>
                    <div className="name">{name}</div>
                </div>
                <img src={url} draggable="false"
                     onClick={() => {
                         console.log('tits')
                         if (hasToken(token)) {
                             // const rect = camRef.current.getBoundingClientRect();
                             // camRef.current.style.top = rect.top + 'px';
                             // camRef.current.style.left = rect.left + 'px';
                             // camRef.current.style.width = rect.width + 'px';
                             // camRef.current.style.height = rect.height + 'px';
                             releaseToken(token);
                             // setTimeout(() => {
                             //     camRef.current.style.transition = 'width 1s, height 1s, top 1s, left 1s';
                             //     camRef.current.style.top = null;
                             //     camRef.current.style.left = null;
                             //     camRef.current.style.width = null;
                             //     camRef.current.style.height = null;
                             //
                             // }, 100)
                         } else {
                             // const rect = camRef.current.getBoundingClientRect();
                             // camRef.current.style.top = rect.top + 'px';
                             // camRef.current.style.left = rect.left + 'px';
                             // camRef.current.style.width = rect.width + 'px';
                             // camRef.current.style.height = rect.height + 'px';
                             acquireToken(setToken);
                             // setTimeout(() => {
                             //     camRef.current.style.transition = 'width 1s, height 1s, top 1s, left 1s';
                             //     camRef.current.style.top = null;
                             //     camRef.current.style.left = null;
                             //     camRef.current.style.width = null;
                             //     camRef.current.style.height = null;
                             //
                             // }, 100)
                         }
                     }}/>
            </div>
            <div className="camera placeholder"></div>
        </Fragment>
    );
}
