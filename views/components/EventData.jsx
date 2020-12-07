import React, {Fragment, useState, useEffect, useRef} from "react";
import {fetch} from "../js/fetch";

export default props => {
    const {data} = props.event;

    const [files, setFiles] = useState([]);

    const update = async () => {
        const files = await fetch(data);
        console.log(files);
        setFiles(files);
    };

    useEffect(() => {
        update();
    }, [data]);

    const pictures = files
        .filter(file=>file.type == 1)
        .map(file=> <img key={file.id} src={file.filename}/>);
    
    return <div>{pictures}</div>
};