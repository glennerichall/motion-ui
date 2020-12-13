import React, {useState, useEffect, useRef, useLayoutEffect} from "react";
// import videojs from 'video.js';
// import 'video.js/dist/video-js.css';

// const VideoPlayer = props => {
//     const ref = useRef();
//
//     useEffect(() => {
//         const player = videojs(ref.current, props, onPlayerReady => {
//             console.log('onPlayerReady');
//         });
//         // return () => player?.dispose();
//     }, []);
//
//     return (
//         <div data-vjs-player>
//             <video ref={ref} className="video-js">
//
//             </video>
//         </div>
//     );
// }

export default props => {
    // const videoJsOptions = {
    //     autoplay: false,
    //     controls: true,
    //     sources: [{
    //         src: props.movie.src,
    //         type: 'video/mp4'
    //     }]
    // }
    //
    // return <VideoPlayer {...videoJsOptions} />
    return (
        <video controls autoPlay name="media" className="movie mp4">
            <source src={props.movie.src} type="video/mp4"/>
        </video>
    );
};