let React = require('react');
let classNames = require('classnames');

function Streams(props) {
    let images = props.streams.map(stream =>
        <div id={'cam-' + stream.id} className={classNames("camera", stream.status)} key={stream.id}>
            <div className="header">
                <div className='events'>
                    <div className='all'/>
                    <div className='today'/>
                </div>
                <div className='last'/>
                <div className="name">{stream.name}</div>
            </div>
            <img src={stream.url} draggable="false"/>
        </div>
    );
    return (
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="stylesheet" href="/css/index.css"/>
            <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials"/>
            <meta name="mobile-web-app-capable" content="yes"/>
            <script src="./js/index.js"/>
        </head>
        <body>
        <div id="panel">{images}</div>
        <div id="version">{props.version}</div>

        <script>
            autoRefreshEvents();
        </script>
        </body>
        </html>
    );
}

module.exports = Streams;