import React, {Fragment, useState, useEffect, useRef} from "react";

export default props => {

    const {event} = props;
    const {id, begin, end, camera, duration} = event;

    return <Fragment>
        <span>{id}</span>
        <span>{camera}</span>
        <span>{begin}</span>
        <span>{end}</span>
        <span>{duration}</span>
    </Fragment>;
}