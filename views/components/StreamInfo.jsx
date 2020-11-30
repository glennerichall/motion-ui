import React, {useState, useEffect, Fragment} from "react";
import classNames from "classnames";
import {fetch} from '../js/fetch';


export default props => {
    const {id, status, url, name, details} = props.stream;

    const [detailsVisible, setDetailsVisible] = useState(false);
    const [info, setDetails] = useState({
        netCamHighResUrl: 0,
        netCamUrl: 0,
        width: 0,
        height: 0
    })

    useEffect(() => {
        (async () => {
            const info = await fetch(details);
            setDetails(info);
        })();
    }, [details, detailsVisible]);

    const {
        netCamHighResUrl,
        netCamUrl,
        width,
        height
    } = info;

    return (
        <Fragment>
            <div onClick={() => setDetailsVisible(!detailsVisible)} className="name">{name}</div>
            <div className={classNames('details', {visible: detailsVisible})}>
                <span>Id</span> <span>{id}</span>
                <span>Status</span> <span>{status}</span>
                <span>Stream url</span> <span>{url}</span>
                <span>High resolution url</span> <span>{netCamHighResUrl}</span>
                <span>Standard resolution url</span> <span>{netCamUrl}</span>
                <span>Width</span> <span>{width}</span>
                <span>Height</span> <span>{height}</span>
            </div>
        </Fragment>
    )
}