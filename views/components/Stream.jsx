import React, {useState, useEffect} from "react";
import classNames from "classnames";
import StreamInfo from "./StreamInfo";

export default props => {

    const {id, status, url, events, name, notifications} = props.stream;
    return (
        <div id={'cam-' + id} className={classNames("camera", status)}>
            <StreamInfo
                events={events}
                name={name}
                id={id}
                notifications={notifications}
            />
            <img src={url} draggable="false"/>
        </div>
    );
}
