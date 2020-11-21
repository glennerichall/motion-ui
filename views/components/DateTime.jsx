import React from "react";
import classNames from "classnames";

export default (props) => {
    const {lastEvent} = props;
    if (lastEvent && lastEvent.begin) {
        const [day, time] = lastEvent.begin.split(' ');
        const [hour, minute] = time.split(':');
        const hm = `${hour}:${minute}`;
        return (
            <div className="last-event">
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