import {v4 as uuidv4} from "uuid";
import React, {useEffect, useRef, useState} from "react";
import classNames from "classnames";

export class Observer {
    constructor() {
        this.componentIndex = {};
        this.changedComponents = {};
        this.observer = new IntersectionObserver(this.onChange, {
            threshold: 0.25
        });
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

export default props => {
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