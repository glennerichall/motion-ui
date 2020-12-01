import React, {Fragment, useState, useEffect, useRef} from "react";
import classNames from "classnames";
import {getSocket} from "../js/socket";
import {fetch} from "../js/fetch";
import EventCount from "./EventCount";
import StreamInfo from "./StreamInfo";
import {acquireToken, releaseToken, hasToken} from "../js/token";

export default props => {

    const socket = getSocket();

    const {id, status, url, events, name, notifications} = props.stream;

    const [eventStatus, setEventStatus] = useState('idle');
    const [connectionStatus, setConnectionStatus] = useState(status);

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
        const {eventStart, eventEnd, statusChanged} = notifications;
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

        socket.on(statusChanged, event => {
            if (event.camera === id) {
                setConnectionStatus(event.status);
            }
        });

        (async () => {
            const {status} = (await fetch(events.status));
            setEventStatus(status);
        })();

        return () => {
            socket.off(eventStart);
            socket.off(eventEnd);
            socket.off(statusChanged);
        }
    }, [notifications]);

    return (
        <Fragment>
            <div id={'cam-' + id}
                 ref={camRef}
                 onTransitionEnd={() => { camRef.current.style.transition = null;}}
                 className={classNames("camera", eventStatus, connectionStatus, {
                     'fullscreen': hasToken(token)
                 })}>
                <div className="header">
                    <EventCount events={events} eventStatus={eventStatus}/>
                    <StreamInfo stream={props.stream}>{name}</StreamInfo>
                </div>
                <img src={url} draggable="false"
                     onError={()=>console.log('error')}
                     onStalled={()=>console.log('stalled')}
                     onClick={() => {
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
