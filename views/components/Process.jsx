import React, {useRef, Component, useState, useEffect} from 'react';
import {fetch} from '../js/fetch';
import Graph from './Graph';
import {getSocket} from "../js/socket";

export default props => {
    const cpuStats = useRef(null);
    const memStats = useRef(null);
    const driveStats = useRef(null);

    const {versionSrc, processSrc} = props;

    const [version, setVersion] = useState(0);

    const socket = getSocket();

    useEffect(() => {
        // initial get version
        (async () => {
            const res = await fetch(versionSrc);
            setVersion(res.version);
        })();

        // on disconnected, re-fetch version, it may be because of server update
        socket.on('connect', () => {
            (async () => {
                const res = await fetch(versionSrc);
                if (version != 0 && version < res.version) {
                    location.reload();
                }
            })();
        });
        return () => socket.off('connect');
    }, [versionSrc]);


    useEffect(() => {
        const fetchCpu = async () => {
            const proc = await fetch(processSrc);
            cpuStats?.current?.update(proc.cpu, 100);
            memStats?.current?.update(proc.mem, 100);
            driveStats?.current?.update(proc.drive, 100);
        };
        const id = setInterval(fetchCpu, 1000);
        return () => clearInterval(id);
    }, [processSrc]);

    return (
        <div id="process" style={props.style}>
            <div id="version">{version}</div>
            <Graph ref={cpuStats} name='cpu' id='cpu' color='white'/>
            <Graph ref={memStats} name='mem' id='mem'/>
            <Graph ref={driveStats} name='drive' id='drive' color='#e3c84f'/>
        </div>
    );

}