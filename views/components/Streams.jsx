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
            if(online) {
                console.log('fetching streams');
                const streams = await fetch(src);
                setStreams(streams);
            }
        })();
    }, [src, online]);

    useEffect(() => {

        const stopped = subscribe(motion.stopped, events => {
            setOnline(false);
        });

        const online = subscribe(motion.online, events => {
            // wait for streams to stabilize
            // force reload since <img> keeps a static image in cache and dosen't reload
            // when motion reconnects
            location.reload();
        });

        return () => {
            unsubscribe(stopped);
            unsubscribe(online);
        }
    }, [] /* once */)

    if (!online) {
        return <div id='offline'>Streams are offline</div>
    }

    let cameras = streams.map(stream =>
        <Stream key={stream.id} stream={stream}/>);
    return (
        <div id="panel">{cameras}</div>
    );
};
