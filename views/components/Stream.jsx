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
    subscribe,
    unsubscribe
} from '../js/pubsub';
import {getNotifications} from "../js/notifications";
import Actions from "./Actions.jsx";
import {
    popView,
    pushView
} from "./Frame.jsx";
import {supportsIntersectionObserver} from "../js/browser-check.js";

const Stream = props => {
    const {className, onClick} = props;
    const notifications = getNotifications();
    const {id, status, url, name, events} = props.stream;

    const [eventStatus, setEventStatus] = useState(status);
    const [connectionStatus, setConnectionStatus] = useState('lost-connection');
    const [src, setSrc] = useState(url);

    const camRef = useRef(null);

    if (supportsIntersectionObserver) {
        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setSrc(url);
                    } else {
                        setSrc(null);
                    }
                },
                {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.01,
                }
            );

            if (camRef.current) {
                observer.observe(camRef.current);
            }

            return () => {
                if (camRef.current) {
                    observer.unobserve(camRef.current);
                }
            };
        }, [camRef]);
    }

    useEffect(() => {
        const event = subscribe(notifications.events.eventTriggered, event => {
            if (event.camera === id) {
                setEventStatus(event.status);
            }
        });

        const connection = subscribe(notifications.streams.connectionStatusChanged, event => {
            if (event.camera === id) {
                console.log(`camera ${id} changed to ${event.status}`)
                if (event.status === 'idle' || event.status === 'connection-ok') {
                    setTimeout(() => {
                        setSrc(url);
                        setConnectionStatus(event.status);
                    }, 1000);
                } else {
                    setSrc(null);
                    setConnectionStatus(event.status);
                }
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
        setTimeout(() => {
            setConnectionStatus('connection-ok');
        }, 1000);
    }

    return (

        <div id={'cam-' + id}
             ref={camRef}
             className={classNames("camera", className, eventStatus, connectionStatus)}>
            <div className="header">
                <Actions camera={id}
                         stream={props.stream}
                         connectionStatus={connectionStatus}
                         eventStatus={eventStatus}/>
                <EventCount events={events}
                            eventStatus={eventStatus}
                            camera={id}/>
                <StreamInfo stream={props.stream}>{name}</StreamInfo>
            </div>

            {
                src !== null ?? (
                    connectionStatus === 'idle' ||
                    connectionStatus === 'recording' ||
                    connectionStatus === 'connection-ok') ?
                    <img src={src} draggable="false"
                         onError={(e) => onError()}
                         onStalled={() => onError()}
                         onClick={onClick}
                    />

                    : <div className="camera placeholder">
                        Connection lost
                    </div>
            }
        </div>
    );
}


export default props => {
    return <Stream {...props}
                   onClick={() => {
                       pushView(
                           <Stream {...props}
                                   onClick={() => popView()}
                                   className={"fullscreen"}/>
                       )
                   }}/>
}