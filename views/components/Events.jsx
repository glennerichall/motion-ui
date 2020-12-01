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
        <div className={classNames('event-list', name)}>
            <span className="header id"></span>
            <span className="header camera"></span>
            <span className="header start"></span>
            <span className="header end"></span>
            <span className="header duration"></span>
            <span className="header link"></span>
            {elems}
        </div>
    );
}