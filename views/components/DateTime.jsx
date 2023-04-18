import React from "react";
import classNames from "classnames";
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

export default (props) => {
    const {lastEvent} = props;
    if (lastEvent?.begin) {
        const date = parseISO(lastEvent.begin);
        let day = format(date, 'yyyy-MM-dd');
        const hm = format(date, 'HH:mm');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if(day === format(new Date(), 'yyyy-MM-dd')) {
            day = 'Today'
        } else if(format(yesterday, 'yyyy-MM-dd')) {
            day = 'Yesterday';
        }
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