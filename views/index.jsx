import regeneratorRuntime from "regenerator-runtime";
import 'babel-polyfill';

import React, {Fragment} from 'react';
import {render} from 'react-dom';

import Streams from './components/Streams';
import Process from './components/Process';
import {processUrl, streamsUrl, versionUrl} from "./constants";

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