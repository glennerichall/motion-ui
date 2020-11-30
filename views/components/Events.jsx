import React, {Fragment, useState, useEffect, useRef} from "react";
import classNames from "classnames";
import {fetch} from "../js/fetch";
import Event from "./Event";

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
        <div className={classNames('event-list', name)}>
            <span className="header">Id</span>
            <span className="header">Camera</span>
            <span className="header">Start</span>
            <span className="header">End</span>
            <span className="header">Duration</span>
            {elems}
        </div>
    );
}