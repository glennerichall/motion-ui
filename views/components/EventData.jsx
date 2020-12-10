import React, {Fragment, useState, useEffect, useRef} from "react";
import {delet, fetch} from "../js/fetch";
import {v4 as uuidv4} from 'uuid';
import classNames from "classnames";
import '../css/camera-data.less';
import icon from "../icons/remove-reverse.png";
import iconHover from "../icons/remove-hover.png";
import {popView} from './Frame';

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
            if (!this.timeout) return;
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
    let {children, observer, ready} = props;

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
        // if (ready) {
        //     children = children.slice(0, last);
        // }
    }

    return (
        <div className={classNames("lazyload-wrapper", {'in-viewport': inViewport}, props.className)}
             ref={ref}>
            {inViewport ?
                children :
                placeholder
            }
        </div>
    )
};

const LazyLoadImage = props => {
    const {file, observer, selected, onClick} = props;
    const [ready, setReady] = useState(false);

    return (
        <LazyLoad key={file.id}
                  observer={observer}
                  ready={ready}
                  className={classNames({selected: selected})}>
            <div className="frame-id">{file.frame}</div>
            <img src={file.srcSmall}
                 className={classNames('frame', {loading: !ready})}
                 onLoad={() => setReady(true)}
                 onClick={onClick}/>
            <img src="/v1/events/data/placeholder.jpg" data-placeholder
                 className={classNames('placeholder', {hidden: ready})}/>
        </LazyLoad>
    );
}


export default props => {
    const {event} = props;
    const {data, id, camera} = event;

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
            <LazyLoadImage file={file}
                           key={file.id}
                           observer={observer}
                           selected={file.id === selected?.id}
                           onClick={() => setSelected(file)}>
            </LazyLoadImage>
        );

    function remove() {
        const response = confirm(`Delete event ${id} for camera ${camera} ?`);
        if (response === true) {
            delet(event.delete);
            popView();
        }
    }

    return (
        <div className="event-data">
            <div className="header">
                <span className="event-id">{event.event}</span>&nbsp;
                <span className="event-time">{event.begin.replace(/\s/g, '\xA0')}</span>
                <span className="event-time">{event.duration.replace(/\s/g, '\xA0')}</span>
                <span className="event-camera">Camera: {camera}</span>
                <span className="delete" onClick={()=>remove(event)}>
                    <img className="danger btn" src={icon}/>
                    <img className="danger btn hover" src={iconHover}/>
                </span>
            </div>
            <div className="pictures">{pictures}</div>
            <div className="selected-picture">
                <img src={selected?.src}/>
            </div>
        </div>
    );
}