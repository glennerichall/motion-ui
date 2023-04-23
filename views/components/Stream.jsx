import React, {
    Fragment,
    useState,
    useEffect,
    useRef
} from "react";
import classNames from "classnames";
import {fetch} from "../js/fetch";
import EventCount from "./EventCount";
import StreamInfo from "./StreamInfo";
import {
    acquireToken,
    releaseToken,
    hasToken
} from "../js/token";
import {
    subscribe,
    unsubscribe
} from '../js/pubsub';
import {getNotifications} from "../js/notifications";
import Actions from "./Actions.jsx";

export default props => {
    const notifications = getNotifications();
    const {id, status, url, name, events} = props.stream;

    const [eventStatus, setEventStatus] = useState('idle');
    const [connectionStatus, setConnectionStatus] = useState('lost-connection');
    const [timestamp, setTimestamp] = useState(new Date().getTime());

    const [token, setToken] = useState({});
    const camRef = useRef(null);

    // useEffect(() => {
    //     if (eventStatus === 'idle') {
    //         releaseToken(token);
    //     } else {
    //         acquireToken(setToken);
    //     }
    // }, [eventStatus]);

    useEffect(() => {
        const event = subscribe(notifications.events.eventTriggered, event => {
            if (event.camera === id) {
                setEventStatus(event.status);
            }
        });

        const connection = subscribe(notifications.streams.connectionStatusChanged, event => {
            if (event.camera === id) {
                console.log(`camera ${id} changed to ${event.status}`)
                setConnectionStatus(event.status);
            }
        });

        (async () => {
            const [evt, str] = await Promise.all([
                fetch(events.status),
                fetch(status)
            ]);
            setEventStatus(evt.status);
            setConnectionStatus(str.status);
        })();

        return () => {
            unsubscribe(event);
            unsubscribe(connection);
        }
    }, [notifications]);

    const onError = () => {
        console.log(`camera image error ${id}`)
        setConnectionStatus('stream-error');
        setTimestamp(new Date().getTime());
        setTimeout(() => {
            setTimestamp(new Date().getTime());
            setConnectionStatus('idle');
        }, 1000);
    }

    return (
        <Fragment>
            <div id={'cam-' + id}
                 ref={camRef}
                 onTransitionEnd={() => { camRef.current.style.transition = null;}}
                 className={classNames("camera", eventStatus, connectionStatus, {
                     'fullscreen': hasToken(token)
                 })}>
                <div className="header">
                    <Actions camera={id} stream={props.stream}/>
                    <EventCount events={events} eventStatus={eventStatus} camera={id}/>
                    <StreamInfo stream={props.stream}>{name}</StreamInfo>
                </div>

                {
                    connectionStatus === 'idle' ||
                    connectionStatus === 'recording' ||
                    connectionStatus === 'connection-ok' ?
                        <img src={url} draggable="false"
                             timestamp={timestamp}
                             onError={(e) => onError()}
                             onStalled={() => onError()}
                             onClick={() => {
                                 if (hasToken(token)) {
                                     releaseToken(token);
                                 } else {
                                     acquireToken(setToken);
                                 }
                             }}/>
                        : <div className="camera placeholder">
                            Connection lost
                        </div>}
            </div>

        </Fragment>
    );
}
