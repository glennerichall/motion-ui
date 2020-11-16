import React, {Component} from "react";
import classNames from "classnames";
import {connect} from "react-redux";

const DateTime = (props) => {
    const {lastEvent} = props;
    if (lastEvent && lastEvent.begin) {
        const [day, time] = lastEvent.begin.split(' ');
        return (
            <div className={classNames("last", 'has-last')}>
                <div>
                    <div className="day">{day}</div>
                    <div className="hour">{time}</div>
                </div>
            </div>
        )
    }
    return (
        <div className="last"/>
    );
};

class StreamInfo extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {all, today, last} = this.props.events;
        const {name} = this.props;
        return (
            <div className="header">
                <div className={classNames("events", {'has-events': !!all.total})}>
                    <div className="all">{all && all.total}</div>
                    <div className='today'>{today && today.total}</div>
                </div>

                <div className="name">{name}</div>
                <DateTime lastEvent={last}/>
                <div className={classNames("heart-beat", {pending})}/>
            </div>
        );
    }
}


export default connect()(StreamInfo);