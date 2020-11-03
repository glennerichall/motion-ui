var React = require('react');

function Streams(props) {
    let images = props.streams.map(stream =>
        <div className={["camera"].concat(stream.status).join(' ')} key={stream.id}>
            <div className="name">{stream.name}</div>
            <img src={stream.url}/>
        </div>
    );
    return (
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <link rel="stylesheet" href="/css/index.css"/>
                <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials"/>
                <meta name="mobile-web-app-capable" content="yes"/>
            </head>
            <body>
                <div id="panel">{images}</div>
                <div id="version">{props.version}</div>
            </body>
        </html>
    );
}

module.exports = Streams;