import React, {Fragment, useState, useEffect, useRef} from "react";

export default props => {

    const {event} = props;
    const {id, begin, end, camera, duration} = event;

    return (
        <tr>
            <td>{id}</td>
            <td>{camera}</td>
            <td>{begin}</td>
            <td>{end}</td>
            <td>{duration}</td>
            <td><a>link</a></td>
        </tr>
    );
}