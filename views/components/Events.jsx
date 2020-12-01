import React, {Fragment, useState, useEffect, useRef} from "react";
import classNames from "classnames";
import {fetch} from "../js/fetch";
import Event from "./Event";

import '../css/events.less';

export default props => {

    const {src, name} = props;
    const [events, setEvents] = useState([]);

    useEffect(() => {
        (async () => {
            const res = await fetch(src);
            setEvents(res);
        })();
    }, [src]);

    const elems = events.map(event => <Event key={event.id} id={event.id} event={event}/>);

    return (
        <table className={classNames('event-list', name)}>
            <thead>
                <tr>
                    <th className="id"></th>
                    <th className="camera"></th>
                    <th className="start"></th>
                    <th className="end"></th>
                    <th className="duration"></th>
                    <th className="link"></th>
                </tr>
            </thead>
            <tbody>{elems}</tbody>
        </table>
    );
}