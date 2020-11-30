import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import Stream from "./Stream";
import {fetch} from '../js/fetch';
import {socket} from "../js/socket";

export default props => {
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
        console.log('tites')
        socket.on('motion-stopped', events => {
            console.log('motion is offline')
            setOnline(false);
        });

        socket.on('motion-restarting', events => {

        });

        socket.on('motion-online', events => {
            console.log('motion is online')
            setTimeout(() => setOnline(true), 10 * 1000 /* 10 seconds */);
        });

        return () => {
            socket.off('motion-stopped');
            socket.off('motion-restarting');
            socket.off('motion-online');
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
