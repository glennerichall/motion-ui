import React, {Fragment, useEffect, useState} from 'react';

import Streams from './Streams';
import Process from './Process';
import Spinner from "./Spinner";

import classNames from "classnames";
import {processUrl, streamsUrl, versionUrl} from "../constants";

import '../css/camera.less';
import '../css/index.css';

import '../js/service-worker';
import {getSocket} from "../js/socket";

import Frame, {pushView, onFrameChanged} from "./Frame";

export default function App(props) {
    const socket = getSocket();

    const [connected, setConnected] = useState(socket.connected);
    const [isFrameRoot, setFrameRoot] = useState(true);

    useEffect(() => {
        pushView(
            <Fragment>
                <Streams src={streamsUrl}/>
            </Fragment>
        );

        socket.on('reconnect', () => {
            console.log('reconnected')
            setConnected(true);
        });

        socket.on('connect', () => {
            console.log('connected')
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('disconnected')
            setConnected(false);
        });

        onFrameChanged(index => {
            setFrameRoot(index == 0);
        })

        // if when rendering socket was not connected and if it has connected
        // before useEffect is called, socket.on('connect') will not be registered
        // then App will never be show, thus check after 1sec if socket is connected.
        setTimeout(()=>{setConnected(socket.connected)}, 1000);

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('version-update');
        }
    }, [1]);


    if (!connected) {
        return <Spinner/>;
    }
    return (
        <Fragment>
            <Process style={isFrameRoot ? {} : {display: 'none'}}
                     versionSrc={versionUrl} processSrc={processUrl}/>
            <Frame/>
        </Fragment>
    );
};