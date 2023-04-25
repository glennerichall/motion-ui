import React, {
    Fragment,
    useEffect,
    useState
} from 'react';
import {
    subscribe,
    unsubscribe
} from '../js/pubsub';

import Streams from './Streams';
import Process from './Process';
import Spinner from "./Spinner";

import {
    processUrl,
    streamsUrl,
    versionUrl
} from "../constants";

import '../css/camera.less';
import '../css/index.css';
import '../js/push';

import {getSocket} from "../js/socket";

import Frame, {
    pushView,
    onFrameChanged
} from "./Frame";

export default function App(props) {
    const socket = getSocket();

    const [connected, setConnected] = useState(socket.connected);
    const [isFrameRoot, setFrameRoot] = useState(true);
    const [headerVisible, setHeaderVisible] = useState(true);

    useEffect(() => {
        pushView(
            <Streams src={streamsUrl}/>
        );

        const reconnect = subscribe('reconnect', () => {
            setConnected(true);
        });

        const connect = subscribe('connect', () => {
            setConnected(true);
        });

        const disconnect = subscribe('disconnect', () => {
            setConnected(false);
        });

        onFrameChanged(index => {
            setFrameRoot(index == 0);
        })

        // if when rendering socket was not connected and if it has connected
        // before useEffect is called, socket.on('connect') will not be registered
        // then App will never be show, thus check after 1sec if socket is connected.
        setTimeout(() => {setConnected(socket.connected)}, 1000);

        return () => {
            unsubscribe(reconnect);
            unsubscribe(connect);
            unsubscribe(disconnect);
        }
    }, [1]);

    if (!connected) {
        return <Spinner/>;
    }
    return (
        <Fragment>
            <Process style={isFrameRoot ? {} : {display: 'none'}}
                     setHeaderVisible={b => setHeaderVisible(b)}
                     headerVisible={headerVisible}
                     versionSrc={versionUrl} processSrc={processUrl}/>
            <Frame />
        </Fragment>
    );
};