import React, {useRef, Component, useState, useEffect} from 'react';
import {fetch} from '../js/fetch';
import Graph from './Graph';

export default props => {
    const cpuStats = useRef(null);
    const memStats = useRef(null);
    const driveStats = useRef(null);

    const {versionSrc, processSrc} = props;

    const [version, setVersion] = useState(0);

    useEffect(() => {
        (async () => {
            const res = await fetch(versionSrc);
            setVersion(res.version);
        })();
    }, [versionSrc]);

    useEffect(() => {
        const fetchCpu = async () => {
            const proc = await fetch(processSrc);
            if (cpuStats) cpuStats.current.update(proc.cpu, 100);
            if (memStats) memStats.current.update(proc.mem, 100);
            if (driveStats) driveStats.current.update(proc.drive, 100);
        };
        const id = setInterval(fetchCpu, 1000);
        return () => clearInterval(id);
    }, [processSrc]);

    return (
        <div id="process">
            <div id="version">{version}</div>
            <Graph ref={cpuStats} name='cpu' id='cpu' color='white'/>
            <Graph ref={memStats} name='mem' id='mem'/>
            <Graph ref={driveStats} name='drive' id='drive' color='#e3c84f'/>
        </div>
    );

}