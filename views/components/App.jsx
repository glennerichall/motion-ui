import React, {Fragment, useEffect, useState} from 'react';

import Streams from './Streams';
import Process from './Process';
import Spinner from "./Spinner";

import {processUrl, streamsUrl, versionUrl} from "../constants";

import '../css/camera.less';
import '../css/index.css';

import '../js/service-worker';
import {socket} from "../js/socket";

export default props => {
    const [connected, setConnected] = useState(false);
    if (!connected && socket.connected) setConnected(true);

    const forceUpdate = useState(false)[1];

    useEffect(() => {

        const id = setTimeout(() => forceUpdate(true), 500);

        socket.on('connect', () => {
            clearTimeout(id);
            setConnected(true);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('version-update');
        }
    }, [1]);

    return (
        connected ?
            <Fragment>
                <Streams src={streamsUrl}/>
                <Process versionSrc={versionUrl} processSrc={processUrl}/>
            </Fragment> :
            <Spinner/>
    );
};