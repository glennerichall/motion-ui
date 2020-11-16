import regeneratorRuntime from "regenerator-runtime";
import 'babel-polyfill';

import React, {Fragment} from 'react';
import {render} from 'react-dom';

import {Provider} from "react-redux";

import Streams from './Streams';
import Process from './Process';

import {store} from "../redux";
import {fetchStreams} from "../redux/reducers";

store.dispatch(fetchStreams);

const App = props =>
    (
        <Fragment>
            <Streams/>
            <Process/>
        </Fragment>
    );

(async () => {
    render(
        <Provider store={store}>
            <App/>
        </Provider>,
        document.getElementById('root')
    );
})();