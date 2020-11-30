import React, {Fragment, useState, useEffect, useRef} from "react";
import intervalToDuration from 'date-fns/intervalToDuration';
import formatDuration from 'date-fns/formatDuration';

export default props => {

    const {event} = props;
    const {id, begin, end, camera} = event;

    const duration = intervalToDuration({
        start: new Date(begin),
        end:   new Date(end)
    });

    console.log(duration)

    return (
        <Fragment>
            <span>{id}</span>
            <span>{camera}</span>
            <span>{begin}</span>
            <span>{end}</span>
            <span>{formatDuration(duration)}</span>
        </Fragment>
    );
}