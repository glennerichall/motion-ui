import {fetch} from "../../js";
import {
    EVENTS_COUNT_RECEIVED,
} from "../actions/types";

import {eventsUrl} from "./constants";

const initialState = {
    events: {}
};

export default function (state = initialState, action) {
    switch (action.type) {
        case EVENTS_COUNT_RECEIVED:
            state = {
                ...state
            };
            state[action.payload.camera] = action.payload;
        default:
            return state;
    }
}

export const fetchEvents = id => async (dispatch, getState) => {
    const all = fetch(`${eventsUrl}/${id}/count`);
    const today = fetch(`${eventsUrl}/${id}/count?date=today`);
    const last = fetch(`${eventsUrl}/${id}/last?date=latest`);

    const info = {
        camera: id,
        all: await all,
        today: await today,
        last: await last
    };

    dispatch({
        type: EVENTS_COUNT_RECEIVED,
        payload: info
    });
}
