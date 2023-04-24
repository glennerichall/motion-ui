import {subscribe, publish, unsubscribe} from '../js/pubsub';
import React, {useState, useEffect} from "react";

const stack = [];

export const SHOW_STACK = 'show-frame';

function update() {
    publish(SHOW_STACK, stack.length - 1);
}

export function pushView(elem) {
    stack.push(elem);
    update();
}

export function popView() {
    if (stack.length > 1) {
        stack.pop();
        update();
    }
}

export function onFrameChanged(listener) {
    subscribe(SHOW_STACK, (elem) => {
        listener(elem);
    });
}

export default props => {
    const [current, setCurrent] = useState(stack.length - 1);

    useEffect(() => {
        const token = subscribe(SHOW_STACK, (index) => {
            setCurrent(index);
        });
        return () => unsubscribe(token);
    }, [1]);

    const elem = stack[current];

    return <div className="frame">
        <div>
            <div className="frame-header">
                {stack.length > 1 ? <div className={'black-btn btn'} id="back-btn"
                                         onClick={() => popView()}>Back</div> : null}
            </div>
            <div className={"frame-content"}>{elem}</div>
        </div>
    </div>;
}