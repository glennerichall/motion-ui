import React, {Fragment, useState, useEffect, useRef} from "react";
import {delet} from "../js/fetch";
import {pushView} from './Frame';
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

import icon from '../icons/remove.png';
import iconHover from '../icons/remove-hover.png';
import EventData from "./EventData";

export default props => {

    const {event} = props;
    let {id, begin, done, camera, duration} = event;

    async function remove() {
        const response = confirm(`Delete event ${id} for camera ${camera} ?`);
        if (response === true) {
            await delet(event.delete);
            props?.onDelete(event);
        }
    }

    begin = format(parseISO(begin), 'yyyy-MM-dd HH:mm');
    done = format(parseISO(done), 'yyyy-MM-dd HH:mm');

    return (
        <tr className={props.className} onClick={() => pushView(<EventData event={event}/>)}>
            <td>{id}</td>
            <td>{camera}</td>
            <td>{begin}</td>
            <td>{done}</td>
            <td>{duration}</td>
            <td className="delete" onClick={(e) => {
                remove();
                e.stopPropagation();
            }}>
                <img className="danger btn" src={icon}/>
                <img className="danger btn hover" src={iconHover}/>
            </td>
        </tr>
    );
}