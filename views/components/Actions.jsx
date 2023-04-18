import React, {
    Fragment,
    useState,
    useEffect,
    useRef
} from "react";
import {
    subscribe,
    unsubscribe
} from "../js/pubsub.js";
import {getNotifications} from "../js/notifications.js";

export default props => {
    const {stream} = props;
    const {status} = stream;

    const [streamStatus, setStreamStatus] = useState(null);
    const notifications = getNotifications();

    useEffect(() => {
        (async () => {
            const streamStatus = await fetch(status);
            setStreamStatus(await streamStatus.json());
        })();
    }, [status]);

    useEffect(() => {
        const event = subscribe(
            notifications.events.eventTriggered,
            ({camera, status}) => {
                if (camera == props.camera) {
                    console.log({camera, status})
                    setStreamStatus({camera, status});
                }
            });

        return () => unsubscribe(event);
    }, [notifications]);

    const record = async () => {
        await fetch(stream.events.trigger,
            {
                method: 'POST'
            });
    }

    const stop = async () => {
        await fetch(stream.events.trigger,
            {
                method: 'DELETE'
            });
    }

    if (streamStatus?.status === 'connection-ok' || streamStatus?.status === 'idle') {
        return <div className="btn black-btn" onClick={record}>Record</div>
    } else if (streamStatus?.status === 'recording') {
        return <div className="btn black-btn" onClick={stop}>Stop</div>
    } else {
        return null
    }
}