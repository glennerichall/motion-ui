import React from "react";
import classNames from "classnames";
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

export default (props) => {
    const {lastEvent} = props;
    if (lastEvent?.begin) {
        const date = parseISO(lastEvent.begin);
        const day = format(date, 'yyyy-MM-dd');
        const hm = format(date, 'HH:mm');
        return (
            <div className="last-event" onClick={props.onClick}>
                <div>
                    <div className="day">{day}</div>
                    <div className="hour">{hm}</div>
                </div>
            </div>
        )
    }
    return (
        <div className="last"/>
    );
};