import React, {Fragment, useEffect, useState} from "react";
import iconPrevious from "../icons/previous.png";
import iconNext from "../icons/next.png";
import LazyLoadImage, {Observer} from './LazyLoadImage';

const scrollIntoView = () => {
    requestAnimationFrame(() => {
        document.querySelector('.event-data .pictures .selected:not(.in-viewport)')
            ?.scrollIntoView({
                behavior: "smooth"
            });
    })
};

export default props => {
    const {images} = props;
    const [selected, setSelected] = useState(0);
    const [observer] = useState(new Observer());

    useEffect(() => {
        return () => observer?.dispose();
    }, [1]);

    const pictures = images
        .map((file, index) =>
            <LazyLoadImage file={file}
                           key={file.id}
                           observer={observer}
                           selected={index === selected}
                           onClick={() => setSelected(index)}>
            </LazyLoadImage>
        );

    return (
        <Fragment>
            <div className="pictures">{pictures}</div>
            <div className="selected-picture">
                <span onClick={() => {
                    if (selected > 0) {
                        setSelected(selected - 1);
                        scrollIntoView();
                    }
                }}>
                    <img src={iconPrevious}/>
                </span>
                <img src={images[selected]?.src}/>
                <span onClick={() => {
                    if (selected < images.length - 1) {
                        setSelected(selected + 1);
                        scrollIntoView();
                    }
                }}>
                    <img src={iconNext}/>
                </span>
            </div>
        </Fragment>

    )
}