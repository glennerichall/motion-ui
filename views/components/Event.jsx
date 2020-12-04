import React, {Fragment, useState, useEffect, useRef} from "react";
import {delet} from "../js/fetch";

import icon from '../icons/remove.png';
import iconHover from '../icons/remove-hover.png';

export default props => {

    const {event} = props;
    const {id, begin, end, camera, duration} = event;

    function remove(event) {
        const response = confirm(`Delete event ${id} for camera ${camera} ?`);
        if (response === true) {
            delet(event.delete);
            props?.onDelete(event);
        }
    }

    return (
        <tr>
            <td>{id}</td>
            <td>{camera}</td>
            <td>{begin}</td>
            <td>{end}</td>
            <td>{duration}</td>
            <td onClick={() => remove(event)}>
                <img className="danger btn" src={icon}/>
                <img className="danger btn hover" src={iconHover}/>
            </td>
        </tr>
    );
}