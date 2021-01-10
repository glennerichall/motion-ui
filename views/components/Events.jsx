import React, {Fragment, useState, useEffect, useRef} from "react";
import classNames from "classnames";
import {delet, fetch} from "../js/fetch";
import Event from "./Event";
import isSameDay from 'date-fns/isSameDay';

import '../css/events.less';
import icon from "../icons/remove-header.png";
import iconHover from "../icons/remove-hover.png";

export default props => {

    const {src, name} = props;
    const [events, setEvents] = useState([]);

    async function update() {
        const res = await fetch(src);
        setEvents(res);
    }

    useEffect(() => {
        update();
    }, [src]);

    async function removeAll() {
        const response = confirm(`Delete all ${events.length} events ?`);
        if (response === true) {
            console.log(src);
            await delet(src);
            await update();
        }
    }
    const elems = events.map((event, index) =>
        <Event onDelete={update}
               key={event.id}
               id={event.id}
               className={
                   classNames(
                       {
                           'last-of-day': !isSameDay(new Date(event.begin),
                               new Date(events[index + 1]?.begin))
                       })}
               event={event}/>
    );

    return (
        <Fragment>
            <div>{`${elems.length} event(s)`}</div>
            <table className={classNames('event-list', name)}>
                <thead>
                <tr>
                    <th className="id"></th>
                    <th className="camera"></th>
                    <th className="start"></th>
                    <th className="end"></th>
                    <th className="duration"></th>
                    <th className="delete" onClick={removeAll}>
                        <img className="danger btn" src={icon}/>
                        <img className="danger btn hover" src={iconHover}/>
                    </th>
                </tr>
                </thead>
                <tbody>{elems}</tbody>
            </table>
        </Fragment>
    );
}