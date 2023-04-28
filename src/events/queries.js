/*
 /events                ? date=@date
 /events/:camera        ? date=@date
 */
export const queryEventsSql = `
    select events.camera,
           to_json(begin)#>>'{}' as begin,
           events.id,
           events.event,
           to_json(done)#>>'{}' as done,
           event_logs.locked
    from events
    inner join event_logs on events.event = event_logs.event
        and events.camera = event_logs.camera
    where events.done is not null
      AND (events.camera = @camera OR @camera IS NULL)
      AND (@date::date = events.begin::date OR @date IS NULL)
      AND event_logs.removed = false
    order by $orderBy
    limit @limit;
`;

/*
 /events/count          ? date=@date & groupby=camera,date
 /events/:camera/count  ? date=@date & groupby=date
*/
export const queryEventCountSql = `
    select $columns
           count(distinct events.event) as total
    from events
    inner join event_logs on events.event = event_logs.event
        and events.camera = event_logs.camera
    where done is not null
      AND (events.camera = @camera OR @camera IS NULL)
      AND (@date::date = begin::date OR @date IS NULL)
      AND removed = false
    $groupBy
`;

export const queryEventDataSql = `
    select events.camera,
           to_json(begin)#>>'{}' as begin,
           type,
           events.id,
           events.event,
           filename,
           frame
    from events
    where (camera = @camera OR @camera IS NULL)
      and (event = @event or @event IS NULL)
      and (@date::date = begin::date OR @date IS NULL)
      and (type = @type OR @type IS NULL)
    order by camera, event, type, begin, frame;
`;

export const queryCalendarSql = `
    select count(*), events.camera, to_char(begin, 'YYYY-MM-DD') as date
    from events
    inner join event_logs on events.event = event_logs.event
        and events.camera = event_logs.camera
    where done is not null and
        (events.camera = @camera OR @camera IS NULL) and
        removed = 'false'
    group by date, events.camera
    order by events.camera, date;
`;

export const updateLockEventsSql = `
    update event_logs
    set locked=$locked
    from events
    where events.event = event_logs.event
        and event_logs.removed = false
        and events.camera = event_logs.camera
        and (events.camera = @camera OR @camera IS NULL)
        and (events.event = @event or @event IS NULL)
        and (@date::date = begin::date OR @date IS NULL)
    returning *;
`;

export const deleteEventsSql = `
    update event_logs
    set removed=true
    from events
    where events.event = event_logs.event
        and event_logs.removed = false
        and event_logs.locked = false
        and events.camera = event_logs.camera
        and (events.camera = @camera OR @camera IS NULL)
        and (events.event = @event or @event IS NULL)
        and (@date::date = begin::date OR @date IS NULL)
    returning *;
`;