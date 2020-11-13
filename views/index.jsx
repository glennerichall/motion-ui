import regeneratorRuntime from "regenerator-runtime";

import {render} from 'react-dom';
import React from 'react';
import 'whatwg-fetch';

import Streams from './streams';

(async () => {
    render(
        <Streams/>,
        document.getElementById('root')
    );
})();