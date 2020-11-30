import {subscribe, publish, unsubscribe} from 'pubsub-js';
import React, {useState, useEffect, Fragment} from "react";

const stack = [];
let count = 0;

export function push(elem) {
    stack.push(elem);
    publish('show', stack.length - 1);
}

export function pop() {
    if (stack.length > 1) {
        const elem = stack.pop();
        publish('show', stack.length - 1);
    }
}

export default props => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        subscribe('show', (_, elem) => {
            setCurrent(elem);
        });
        return () => unsubscribe('show');
    }, [1]);

    const elem = stack[current];

    return <div className="frame">
        <div className="frame-header">
        {stack.length > 1 ? <div id="back-btn" onClick={() => pop()}>Back</div> : null}
        </div>
        {elem}
    </div>;
}