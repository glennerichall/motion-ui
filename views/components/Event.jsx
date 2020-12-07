import React, {Fragment, useState, useEffect, useRef} from "react";
import {delet} from "../js/fetch";
import {pushView} from './Frame';

import icon from '../icons/remove.png';
import iconHover from '../icons/remove-hover.png';
import EventData from "./EventData";

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
        <tr onClick={() => pushView(<EventData event={event}/>)}>
            <td>{id}</td>
            <td>{camera}</td>
            <td>{begin}</td>
            <td>{end}</td>
            <td>{duration}</td>
            <td onClick={(e) => {
                remove(event);
                e.stopPropagation();
            }}>
                <img className="danger btn" src={icon}/>
                <img className="danger btn hover" src={iconHover}/>
            </td>
        </tr>
    );
}