import React, {useState, useEffect, useRef} from "react";
import {delet, fetch} from "../js/fetch";

import '../css/camera-data.less';
import icon from "../icons/remove-reverse.png";
import iconHover from "../icons/remove-hover.png";
import iconDisabled from "../icons/remove-reverse-disabled.png";

import {popView} from './Frame';
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import DataImage from "./DataImage";
import DataMp4 from './DataMp4';

export default props => {
    const {event} = props;
    let {data, id, camera, begin, duration} = event;

    const ref = useRef();
    const [images, setImages] = useState([]);
    const [movie, setMovie] = useState(null);
    const [selection, setSelection] = useState('');
    const [deleteRequested, setDeleteRequested] = useState(false);

    const update = async () => {
        const files = await fetch(data);
        const images = files.filter(file => file.type == 1);
        const movie = files.filter(file => file.type == 8)[0] ?? null;
        const selection = selection ?? movie != null ? 'movie' : files.length > 0 ? 'files' : '';
        setImages(images);
        setMovie(movie);
        setSelection(selection);
    };

    useEffect(() => {
        update();
    }, [data]);

    async function remove() {
        if(deleteRequested) return;
        const response = confirm(`Delete event ${id} for camera ${camera} ?`);
        if (response === true) {
            setDeleteRequested(true);
            await delet(event.delete);
            popView();
        }
    }

    begin = format(parseISO(begin), 'yyyy-MM-dd HH:mm');

    let display = null;
    switch (selection) {
        case 'images':
            display = <DataImage images={images}/>;
            break;
        case 'movie':
            display = <DataMp4 movie={movie}/>;
            break;
        default: display = <div>No data for this event</div>
    }

    return (
        <div className="event-data" ref={ref}>
            <div className="header">
                <span className="event-id">{event.id}</span>&nbsp;
                <span className="event-time">{begin.replace(/\s/g, '\xA0')}</span>
                <span className="event-time">{duration.replace(/\s/g, '\xA0')}</span>
                <span className="event-camera">Camera: {camera}</span>
                <span className="delete" onClick={() => remove(event)}>
                    <img className="danger btn" src={deleteRequested ? icon : iconDisabled}/>
                    <img className="danger btn hover" src={deleteRequested ? iconHover : iconDisabled}/>
                </span>

                {
                    images.length !== 0 && movie !== null ?
                        <select value={selection} onChange={evt => setSelection(evt.target.value)}>
                            <option value="movie">Movie</option>
                            <option value="images">Images</option>
                        </select>
                        : null
                }
            </div>
            {display}
        </div>
    );
}