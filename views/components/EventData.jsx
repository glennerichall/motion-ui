import React, {Fragment, useState, useEffect, useRef} from "react";
import {fetch} from "../js/fetch";
import {v4 as uuidv4} from 'uuid';
import classNames from "classnames";
// import LazyLoad from 'react-lazyload';

const componentIndex = {};

const onChange = elems => {
    elems.forEach(event => {
        const {id} = event.target;
        if (componentIndex[id] !== undefined) {
            componentIndex[id](event.isIntersecting);
        }
    });
};
let observer = new IntersectionObserver(onChange);

const LazyLoad = props => {

    const ref = useRef();
    const [inViewport, setInViewport] = useState(false);

    useEffect(() => {
        const id = uuidv4();
        componentIndex[id] = setInViewport;
        ref.current.id = id;
        observer.observe(ref.current);
        return () => {
            delete componentIndex[id];
            observer.unobserve(ref.current)
        }
    }, [1]);

    let placeholder = <div style={{
        width: '100%',
        height: '100%'
    }}/>;

    let {children} = props;

    const last = children.length - 1;

    if (children.length >= 2 && children[last].props['data-placeholder']) {
        placeholder = children[last];
        children = children.slice(0, last);
    }

    return (
        <div className={classNames("lazyload-wrapper", {'in-viewport': inViewport}, props.className)}
             ref={ref}>
            {
                inViewport ?
                    children :
                    placeholder
            }
        </div>
    )
};

import '../css/camera-data.less';

export default props => {
    const {data} = props.event;

    const [images, setImages] = useState([]);
    const [selected, setSelected] = useState(null);

    const update = async () => {
        const files = await fetch(data);
        setImages(files.filter(file => file.type == 1));
        setSelected[files[0]];
    };

    useEffect(() => {
        update();
    }, [data]);


    const pictures = images
        .map(file =>
            <LazyLoad key={file.id} className={classNames({selected: file.id === selected?.id})}>
                <div style={{
                    position: 'absolute',
                    fontSize: 'initial',
                    zIndex: '1000',
                    background: 'red'
                }}>{file.id}</div>
                <img src={file.srcSmall} onClick={() => setSelected(file)}/>
                <img src={images[0].srcSmall} data-placeholder/>
            </LazyLoad>);

    return (
        <div className="event-data">
            <div className="pictures">{pictures}</div>
            <div className="selected-picture">
                <img src={selected?.src}/>
            </div>
        </div>
    );
}