import React, {Fragment, Component} from 'react';
import classNames from 'classnames';
import {fetch} from './js/index';

const api = 'v1';

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
        this.state = {
            events: [],
            today: null,
            lastEvent: null
        };
    }

    componentDidMount() {
        this.tick();
    }

    componentWillUnmount() {
        clearTimeout(this.timerID);
    }

    tick() {

        const {id} = this.props.stream;
        this.setState({pending: true});
        (async () => {
            const events = await fetch(`${api}/events/${id}/count`);
            const today = await fetch(`${api}/events/${id}/count?date=today`);
            const lastEvent = await fetch(`${api}/events/${id}/last?date=latest`);

            this.setState({
                events,
                today,
                lastEvent
            });

            this.timerID = setTimeout(
                () => this.tick(),
                5000   // 5 seconds
            );
            setTimeout(() => this.setState({pending: false}), 1000);
        })();
    }

    render() {
        const {events, today, lastEvent, pending} = this.state;
        const {name} = this.props.stream;
        return (
            <div className="header">
                <div className={classNames("events", {'has-events': !!events.total})}>
                    <div className="all">{events && events.total}</div>
                    <div className='today'>{today && today.total}</div>
                </div>

                <div className="name">{name}</div>
                <DateTime lastEvent={lastEvent}/>
                <div className={classNames("heart-beat", {pending})}/>
            </div>
        );
    }
}

class Stream extends Component {
    constructor(props) {super(props);}

    render() {
        const {id, status, url} = this.props.stream;
        return (
            <div id={'cam-' + id} className={classNames("camera", status)}>
                <StreamInfo stream={this.props.stream}/>
                <img src={url} draggable="false"/>
            </div>
        );
    }
}

export default class Streams extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000 * 60 * 5 // 5 minutes
        );
        this.tick();
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        (async () => {
            const streams = await fetch(`${api}/streams`);
            this.setState({
                streams
            });
        })();
    }

    render() {
        if (!this.state) return (<div/>);

        const {streams} = this.state;

        let cameras = streams.map(stream => <Stream key={stream.id} stream={stream}/>);
        return (
            <Fragment>
                <div id="panel">{cameras}</div>
            </Fragment>
        );
    }
}


