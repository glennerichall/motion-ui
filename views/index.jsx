import 'babel-polyfill';
import React from 'react';
import {render} from 'react-dom';

import App from "./components/App";
import {initSocket} from "./js/socket";
import {fetchNotifications} from "./js/notifications";

(async () => {
    // const {App} = await import("./components/App");
    await Promise.all([initSocket(), fetchNotifications()]);
    render(<App/>,
        document.getElementById('root')
    );
})();