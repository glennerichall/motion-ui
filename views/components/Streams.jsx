import React, {Fragment, Component} from 'react';
import {connect} from "react-redux";

import classNames from 'classnames';
import Stream from "./Stream";

class Streams extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {streams} = this.props;
        let cameras = streams.map(stream =>
            <Stream key={stream.id} stream={stream}/>);
        return (
            <div id="panel">{cameras}</div>
        );
    }
}

const mapStateToProps = (state) => {
    const {streams} = state;
    return streams;
}

export default connect(mapStateToProps)(Streams);