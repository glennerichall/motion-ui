import React, {Component} from "react";
import classNames from 'classnames';

export default class Graph extends Component {
    setRef = ref => this.ref = ref;

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const fg = this.props.color || '#0ff';
        const bg = this.props.background || '#002';
        this.panel(this.props.name, fg, bg);
    }

    panel(name, fg, bg) {

        let _min = Infinity, _max = 0;
        const round = Math.round;
        const PR = round(window.devicePixelRatio || 1);

        const WIDTH = 80 * PR, HEIGHT = 48 * PR,
            TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
            GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
            GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

        const canvas = this.ref;
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.cssText = 'width:80px;height:48px';

        const context = canvas.getContext('2d');
        context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
        context.textBaseline = 'top';

        context.fillStyle = bg;
        context.fillRect(0, 0, WIDTH, HEIGHT);

        context.fillStyle = fg;
        context.fillText(name, TEXT_X, TEXT_Y);
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        this.update = (value, maxValue) => {
            let min = Math.min(_min, value);
            let max = Math.max(_max, value);

            context.fillStyle = bg;
            context.globalAlpha = 1;
            context.fillRect(0, 0, WIDTH, GRAPH_Y);
            context.fillStyle = fg;
            context.fillText(' ' + round(value / maxValue * 100) + '% ' + name,
                TEXT_X, TEXT_Y);

            context.drawImage(canvas,
                GRAPH_X + PR,
                GRAPH_Y,
                GRAPH_WIDTH - PR,
                GRAPH_HEIGHT,
                GRAPH_X,
                GRAPH_Y,
                GRAPH_WIDTH - PR,
                GRAPH_HEIGHT
            );

            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR,
                GRAPH_Y,
                PR,
                GRAPH_HEIGHT
            );

            context.fillStyle = bg;
            context.globalAlpha = 0.9;
            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR,
                GRAPH_Y,
                PR,
                round((1 - (value / maxValue)) * GRAPH_HEIGHT)
            );

        };
    }

    render() {
        return (
            <canvas className={classNames("graph", this.props.className)} id={this.props.id} ref={this.setRef}/>
        )
    }

}