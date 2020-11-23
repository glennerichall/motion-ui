import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import Stream from "./Stream";
import {fetch} from '../js/fetch';
import {socket} from "../js/socket";

export default props => {
    const {src} = props;
    const [streams, setStreams] = useState([]);

    useEffect(() => {
        (async () => {
            const streams = await fetch(src);
            setStreams(streams);
        })();
    }, [src]);

    let cameras = streams.map(stream =>
        <Stream key={stream.id} stream={stream}/>);
    return (
        <div id="panel">{cameras}</div>
    );
};
