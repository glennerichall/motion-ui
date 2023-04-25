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
    const {stream, connectionStatus, eventStatus} = props;

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

    if (connectionStatus === 'connection-ok' && eventStatus === 'idle') {
        return <div className="btn black-btn btn-fit" onClick={record}>Rec</div>
    } else if (eventStatus === 'recording') {
        return <div className="btn black-btn" onClick={stop}>Stop</div>
    } else {
        return null
    }
}