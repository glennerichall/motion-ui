var React = require('react');

function Streams(props) {
    let images = props.streams.map(stream=><img src={stream.url}/>);
    return <div>{images}</div>;
}

module.exports = Streams;