import {createStore, applyMiddleware} from "@reduxjs/toolkit";
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

import rootReducer from "./reducers";

export default createStore(rootReducer, composedEnhancer);