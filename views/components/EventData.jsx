import React, {Fragment, useState, useEffect, useRef} from "react";
import {fetch} from "../js/fetch";
import {v4 as uuidv4} from 'uuid';
import classNames from "classnames";
import '../css/camera-data.less';
import {cancelTimeout} from "react-window/src/timer";

class Observer {
    constructor() {
        this.componentIndex = {};
        this.changedComponents = {};
        this.observer = new IntersectionObserver(this.onChange);
    }

    onChange = (events) => {

        for (let event of events) {
            const {id} = event.target;
            this.changedComponents[id] = event.isIntersecting;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = setTimeout(() => {
            if(!this.timeout) return;
            for (let id in this.changedComponents) {
                const changed = this.changedComponents[id];
                const component = this.componentIndex[id];
                if (component && changed !== component.visible) {
                    component.setInViewport(changed);
                    component.visible = changed;
                }
            }
            this.changedComponents = {};
            this.timeout = undefined;
        }, 200);

    };

    observe(elem, setInViewport) {
        const id = uuidv4();
        this.componentIndex[id] = {
            visible: false,
            setInViewport
        };
        elem.id = id;
        this.observer.observe(elem);
    }

    unobserve(elem) {
        delete this.componentIndex[elem.id];
    }

    dispose() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.observer.disconnect();
    }
}


const LazyLoad = props => {
    let {children, observer} = props;

    const ref = useRef();
    const [inViewport, setInViewport] = useState(false);

    useEffect(() => {
        observer.observe(ref.current, setInViewport);
        return () => {
            observer.unobserve(ref.current)
        }
    }, [1]);

    let placeholder = <div style={{
        width: '100%',
        height: '100%'
    }}/>;


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


export default props => {
    const {data} = props.event;

    const [images, setImages] = useState([]);
    const [selected, setSelected] = useState(null);
    const [observer, setObserver] = useState(null);

    const update = async () => {
        const files = await fetch(data);
        setImages(files.filter(file => file.type == 1));
        setSelected(files[0]);
    };

    useEffect(() => {
        update();
    }, [data]);

    useEffect(() => {
        setObserver(new Observer());
        return () => observer?.dispose();
    }, [1]);

    const pictures = images
        .map(file =>
            <LazyLoad key={file.id}
                      observer={observer}
                      className={classNames({selected: file.id === selected?.id})}>
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