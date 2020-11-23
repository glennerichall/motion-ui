import 'babel-polyfill';
import React from 'react';
import {render} from 'react-dom';

import App from "./components/App";

(async () => {
    render(<App/>,
        document.getElementById('root')
    );
})();