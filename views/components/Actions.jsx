import React, {
    Fragment,
    useState,
    useEffect,
    useRef
} from "react";

export default props => {
    const {stream} = props;
    const {status} = stream;

    console.log(stream)

    const [streamStatus, setStreamStatus] = useState(null);

    useEffect(() => {
        (async () => {
            const streamStatus = await fetch(status);
            setStreamStatus(await streamStatus.json());
        })();
    }, [status])

    const record = async()=>{
        await fetch(stream.events.trigger,
            {
                method: 'POST'
            });
    }

    if (streamStatus?.status === 'connection-ok') {
        return <div className="btn black-btn" onClick={record}>Start record</div>
    } else {
        return null
    }
}