import regeneratorRuntime from "regenerator-runtime";
import 'babel-polyfill';

import {render} from 'react-dom';
import React, {Fragment} from 'react';
// import 'whatwg-fetch';

import Streams from './streams';
import Process from './proc';

(async () => {
    render(
        <Fragment>
            <Streams/>
            <Process/>
        </Fragment>,
        document.getElementById('root')
    );
})();