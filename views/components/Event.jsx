import React, {Fragment, useState, useEffect, useRef} from "react";
import {delet} from "../js/fetch";
import {pushView} from './Frame';
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

import icon from '../icons/remove.png';
import iconHover from '../icons/remove-hover.png';
import iconDisabled from '../icons/remove-reverse-disabled.png';
import EventData from "./EventData";

export default props => {

    const {event} = props;
    let {id, begin, done, camera, duration} = event;
    const [deleteRequested, setDeleteRequested] = useState(false);

    async function remove() {
        if(deleteRequested) return;
        const response = confirm(`Delete event ${id} for camera ${camera} ?`);
        if (response === true) {
            setDeleteRequested(true);
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
                <img className="danger btn" src={!deleteRequested ? icon : iconDisabled}/>
                <img className="danger btn hover" src={!deleteRequested ? iconHover : iconDisabled}/>
            </td>
        </tr>
    );
}