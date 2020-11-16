import {
    STREAMS_RECEIVED
} from "../actions/types";
import {fetch} from "../../js";

import {streamsUrl} from "./constants";
import {fetchEvents} from "./events";

const initialState = {
    streams: []
};

export default function (state = initialState, action) {
    switch (action.type) {
        case STREAMS_RECEIVED:
            return action.payload;
        default:
            return state;
    }
}

export async function fetchStreams(dispatch, getState) {
    const streams = await fetch(`${streamsUrl}`);
    dispatch({type: STREAMS_RECEIVED, payload: {streams}})
    streams.forEach(stream => dispatch(fetchEvents(stream.id)));
}
