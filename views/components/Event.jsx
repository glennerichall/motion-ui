import React, {Fragment, useState, useEffect, useRef} from "react";

import icon from '../icons/remove.png';
import iconHover from '../icons/remove-hover.png';

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
            <td>
                <img className="danger btn" src={icon} />
                <img className="danger btn hover" src={iconHover} />
            </td>
        </tr>
    );
}