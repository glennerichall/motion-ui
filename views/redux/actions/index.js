import {
    UPDATE_PROCESS,
    NEW_EVENT,
    UPDATE_STREAM,
    FETCH_STREAMS
} from "./types";

export const updateProcess = () => ({
    type: UPDATE_PROCESS,
});

export const updateStreams = () => ({
    type: FETCH_STREAMS,
});

export const updateStream = (id) => ({
    type: UPDATE_STREAM,
    payload: {id}
});

export const streamReceived = (id) => ({
    type: UPDATE_STREAM,
    payload: {id}
});