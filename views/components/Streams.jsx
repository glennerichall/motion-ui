import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import Stream from "./Stream";
import {fetch} from '../js/fetch';
import {subscribe, unsubscribe} from '../js/pubsub';
import {getNotifications} from "../js/notifications";

export default props => {
    const {motion} = getNotifications();
    const {src} = props;
    const [streams, setStreams] = useState([]);
    const [online, setOnline] = useState(true);

    useEffect(() => {
        (async () => {
            const streams = await fetch(src);
            setStreams(streams);
        })();
    }, [src, online]);

    useEffect(() => {

        const stopped = subscribe(motion.stopped, events => {
            setOnline(false);
        });

        const online = subscribe(motion.online, events => {
            // wait for streams to stabilize
            setTimeout(() => setOnline(true), 30 * 1000 /* 30 seconds */);
        });

        return () => {
            unsubscribe(stopped);
            unsubscribe(online);
        }
    }, [1] /* once */)

    if (!online) {
        return <div id='offline'>Streams are offline</div>
    }

    let cameras = streams.map(stream =>
        <Stream key={stream.id} stream={stream}/>);
    return (
        <div id="panel">{cameras}</div>
    );
};
