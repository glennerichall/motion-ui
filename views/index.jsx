import 'babel-polyfill';
import React from 'react';
import {render} from 'react-dom';

import App from "./components/App";
import {initSocket} from "./js/socket";

(async () => {
    // const {App} = await import("./components/App");
    await initSocket();
    render(<App/>,
        document.getElementById('root')
    );
})();