import React, {Fragment, useEffect, useState} from 'react';

import Streams from './Streams';
import Process from './Process';
import Spinner from "./Spinner";

import {processUrl, streamsUrl, versionUrl} from "../constants";

import '../css/camera.less';
import '../css/index.css';

import '../js/service-worker';
import {socket} from "../js/socket";

import Frame, {push} from "./Frame";

export default props => {
    const [connected, setConnected] = useState(false);

    if (!connected && socket.connected) setConnected(true);

    const forceUpdate = useState(false)[1];

    useEffect(() => {

        push(
            <Fragment>
                <Process versionSrc={versionUrl} processSrc={processUrl}/>
                <Streams src={streamsUrl}/>
            </Fragment>
        );

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


    if (!connected) {
        return <Spinner/>;
    }
    return <Fragment>

        <Frame/>
    </Fragment>;
};