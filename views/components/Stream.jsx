import React, {Component} from "react";
import classNames from "classnames";
import {connect} from "react-redux";
import StreamInfo from "./StreamInfo";

class Stream extends Component {
    constructor(props) {super(props);}

    render() {
        const {id, status, url, events, name} = this.props.stream;
        return (
            <div id={'cam-' + id} className={classNames("camera", status)}>
                <StreamInfo events={events} name={name}/>
                <img src={url} draggable="false"/>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const {events} = state.events[ownProps.stream.id];
    return events;
}

export default connect(mapStateToProps)(Stream);