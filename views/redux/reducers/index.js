import {fetch} from "../../js";

import {combineReducers} from "redux";
import streams from "./streams";
import events from "./events";

export default combineReducers({streams});

export {fetchStreams} from './streams';
export {fetchEvents} from './events';