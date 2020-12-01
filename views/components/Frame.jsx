import {subscribe, publish, unsubscribe} from 'pubsub-js';
import React, {useState, useEffect, Fragment} from "react";

const stack = [];

export const SHOW_STACK = 'show-stack';

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

export function onFrameChanged(listener){
    subscribe(SHOW_STACK, (_, elem) => {
        listener(elem);
    });
}

export default props => {
    const [current, setCurrent] = useState(-1);

    useEffect(() => {
        subscribe(SHOW_STACK, (_, elem) => {
            setCurrent(elem);
        });
        return () => unsubscribe(SHOW_STACK);
    }, [1]);

    const elem = stack[current];

    return <div className="frame">
        <div className="frame-header">
            {stack.length > 1 ? <div id="back-btn" onClick={() => popView()}>Back</div> : null}
        </div>
        {elem}
    </div>;
}