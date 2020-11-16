import {
    STREAMS_RECEIVED,
    FETCH_STREAMS,
    EVENTS_COUNT_RECEIVED
} from "../actions/types";
import {fetch} from "../../js";

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