import regeneratorRuntime from "regenerator-runtime";
import 'babel-polyfill';

import React, {Fragment} from 'react';
import {render} from 'react-dom';

import Streams from './components/Streams';
import Process from './components/Process';
import {processUrl, streamsUrl, versionUrl} from "./constants";

import { io } from 'socket.io-client';

const socket = io("ws://localhost:3000/", {
    reconnectionDelayMax: 10000
});

socket.on('new-event', event=>{
    console.log(event);
});

const App = props =>
    (
        <Fragment>
            <Streams src={streamsUrl}/>
            <Process versionSrc={versionUrl} processSrc={processUrl}/>
        </Fragment>
    );

(async () => {
    render(<App/>,
        document.getElementById('root')
    );
})();