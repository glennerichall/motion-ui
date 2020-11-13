import regeneratorRuntime from "regenerator-runtime";

import {render} from 'react-dom';
import React from 'react';
import 'whatwg-fetch';

import Streams from './streams';

(async () => {
    const api = await (await fetch('http://localhost:3000/version')).json();
    const streams = await (await fetch('http://localhost:3000/streams')).json();
    const events = await (await fetch('http://localhost:3000/events/count?date=everyday')).json();
    const lastEvent = await (await fetch('http://localhost:3000/events/last?date=latest')).json();
    render(
        <Streams streams={streams}
                 version={api.version}
                 events={events}
                 lastEvent={lastEvent}
        ></Streams>,
        document.getElementById('root')
    );
})();