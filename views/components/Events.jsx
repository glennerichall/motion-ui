import React, {
    Fragment,
    useState,
    useEffect,
    useRef
} from "react";
import classNames from "classnames";
import {
    delet,
    fetch
} from "../js/fetch";
import Event from "./Event";
import isSameDay from 'date-fns/isSameDay';

import '../css/events.less';
import icon from "../icons/remove-header.png";
import iconHover from "../icons/remove-hover.png";
import iconDisabled from "../icons/remove-reverse-disabled.png";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../css/calendar.less';
import {format} from "date-fns";

// let statesStack = {};
// const useStateStack = key => {
//     return [
//         value => statesStack[key].push(value),
//         () => statesStack[key].pop(),
//     ]
// }
//
// const WrapWithCache = (component, propsToCache) => {
//     let memoized;
//     return props => {
//
//         useEffect(() => {
//             return () => {
//                 memoized = value
//             }
//         }, []);
//         return component({...props});
//     }
// }

export default props => {

    const {src, name, calendar, camera, currentDate = new Date()} = props;

    const [eventSrc, setEventSrc] = useState(src);
    const [events, setEvents] = useState([]);
    const [days, setDays] = useState({});
    const [months, setMonths] = useState({});
    const [deleteRequested, setDeleteRequested] = useState(false);
    const [selectedDate, setSelectedDate] = useState(currentDate);

    async function updateEvents() {
        const res = await fetch(eventSrc);
        setEvents(res);
    }

    async function updateCalendar() {
        let res = await fetch(calendar);
        const months = res.reduce((prev, cur) => {
            let ym = cur.date.split('-');
            ym = ym[0] + '-' + ym[1];
            if (!prev[ym]) {
                prev[ym] = 0;
            }
            prev[ym] += Number.parseInt(cur.count);
            return prev;
        }, {});

        res = res.reduce((prev, cur) => {
            prev[cur.date] = cur;
            return prev;
        }, {});
        setDays(res);
        setMonths(months);
    }

    const onChange = date => {
        setSelectedDate(date);
    }

    useEffect(() => {
        const key = format(selectedDate, 'yyyy-MM-dd');
        const day = days[key];
        if (!!day) {
            setEventSrc(day.events);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (!!eventSrc) {
            updateEvents();
        }
    }, [eventSrc]);

    useEffect(() => {
        if (calendar) {
            (async () => {
                await updateCalendar();
                setSelectedDate(new Date());
            })();
        }
    }, [calendar]);

    async function removeAllInPage() {
        if (deleteRequested) return;
        const response = confirm(`Delete all ${events.length} events ?`);
        if (response === true) {
            setDeleteRequested(true);
            await delet(src);
            await updateEvents();
        }
    }

    const elems = events.map((event, index) =>
        <Event onDelete={updateEvents}
               key={event.id}
               id={event.id}
               className={
                   classNames(
                       {
                           'last-of-day': !isSameDay(new Date(event.begin),
                               new Date(events[index + 1]?.begin))
                       })}
               event={event}/>
    );

    const tileContent = ({activeStartDate, date, view}) => {
        const key = format(date, 'yyyy-MM-dd');
        if (view === 'month') {
            const d = days[key];
            if (d) {
                return <div className={'calendar-day'}>
                <span>
                    {d.count}
                </span>
                </div>
            } else {
                return null;
            }
        } else if (view === 'year') {
            let ym = key.split('-');
            ym = ym[0] + '-' + ym[1];
            const month = months[ym];
            if (month) {
                return <div className={'calendar-day'}>
                <span>
                    {month}
                </span>
                </div>
            }
            return null;
        }
    }

    const tileDisabled = ({activeStartDate, date, view}) => {
        const key = format(date, 'yyyy-MM-dd');
        if (view === 'month') {
            return !days[key];
        } else if (view === 'year') {
            let ym = key.split('-');
            ym = ym[0] + '-' + ym[1];
            return !months[ym];
        }
    };

    async function deleteAllEventsInDatabase() {
        if (deleteRequested) return;
        const response = confirm(`Delete all events for camera ${camera} from database ? This can't be undone`);
        if (response === true) {
            setDeleteRequested(true);
            await delet(`/v1/events/${camera}`);
            await updateEvents();
        }
    }

    return (
        <div id="events">
            <div className="camera-name">Camera {camera}</div>
            {calendar ?
                <>
                    <div className="black-btn btn delete-all"
                         onClick={deleteAllEventsInDatabase}
                         style={{
                             marginBottom: "1em",
                             alignSelf: "flex-end"
                         }}>
                        Delete all evens for camera {camera}
                    </div>
                    <Calendar onChange={onChange}
                              tileContent={tileContent}
                              tileDisabled={tileDisabled}
                              value={selectedDate}/>
                </> : null
            }
            <div>{`${elems.length} event(s)`}</div>
            <div className="scrollable">
                <table className={classNames('event-list', name)}>
                    <thead>
                    <tr>
                        <th className="id"></th>
                        <th className="camera"></th>
                        <th className="start"></th>
                        <th className="end"></th>
                        <th className="duration"></th>
                        <th className="delete" onClick={removeAllInPage}>
                            <img className="danger btn" src={!deleteRequested ? icon : iconDisabled}/>
                            <img className="danger btn hover" src={!deleteRequested ? iconHover : iconDisabled}/>
                        </th>
                    </tr>
                    </thead>
                    <tbody>{elems}</tbody>
                </table>
            </div>
        </div>
    );
}