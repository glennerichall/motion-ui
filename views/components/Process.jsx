import React, {useRef, Component, useState, useEffect} from 'react';
import {fetch, post} from '../js/fetch';
import Graph from './Graph';
import classNames from 'classnames';
import cleanHover from '../icons/clean-hover.png';
import clean from '../icons/clean.png';
import '../css/process.less';

export default props => {
    const cpuStats = useRef(null);
    const memStats = useRef(null);
    const driveStats = useRef(null);

    const {versionSrc, processSrc} = props;

    const [version, setVersion] = useState(0);
    const [hideGraphs, setHideGraphs] = useState(false);

    useEffect(() => {
        // initial get version
        (async () => {
            const res = await fetch(versionSrc);
            setVersion(res.version);
        })();

        // periodically, re-fetch version, it may be because of server update
        const key = setInterval(async () => {
            const res = await fetch(versionSrc);
            if (version != 0 && version < res.version) {
                location.reload();
            }
        }, 60 * 1000 /* 1 minute */);
        return () => clearInterval(key);
    }, [versionSrc]);


    useEffect(() => {
        const fetchCpu = async () => {
            const proc = await fetch(processSrc);
            cpuStats?.current?.update(proc.cpu, 100);
            memStats?.current?.update(proc.mem, 100);
            driveStats?.current?.update(proc.drive, 100);
        };
        const id = setInterval(fetchCpu, 5 * 1000 /* 5 seconds */);
        fetchCpu();
        return () => clearInterval(id);
    }, [processSrc]);

    return (
        <div id="process" style={props.style}>
            <div id="version" onClick={() => setHideGraphs(!hideGraphs)}>{version}</div>
            <div className="actions">
                <span className="action clean-events"
                      onClick={()=>post('/v1/events/exec/clean-events')}>
                    <img src={cleanHover} className="hover"/>
                    <img src={clean} />
                </span>
            </div>
            <Graph className={classNames({hidden: hideGraphs})} ref={cpuStats} name='cpu' id='cpu' color='white'/>
            <Graph className={classNames({hidden: hideGraphs})} ref={memStats} name='mem' id='mem'/>
            <Graph className={classNames({hidden: hideGraphs})} ref={driveStats} name='drive' id='drive'
                   color='#e3c84f'/>
        </div>
    );

}