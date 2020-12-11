
/*
 /events                ? date=@date
 /events/:camera        ? date=@date
 */
const queryEventsSql = `
    select camera,
           begin::date as date,
           begin,
           id,
           event,
           done
    from event_logs
    where done is not null
      AND (camera = @camera OR @camera IS NULL)
      AND (@date::date = begin::date OR @date IS NULL)
    order by $orderBy
    limit @limit;
`;

/*
 /events/count          ? date=@date & groupby=camera,date
 /events/:camera/count  ? date=@date & groupby=date
*/
const queryEventCountSql = `
    select $columns
           count(distinct event) as total
    from event_logs
    where done is not null
      AND (camera = @camera OR @camera IS NULL)
      AND (@date::date = begin::date OR @date IS NULL)
    $groupBy
`;

const queryEventDataSql = `
    select camera,
           time::date as date,
           time,
           type,
           id,
           event,
           filename,
           frame
    from events
    where (camera = @camera OR @camera IS NULL)
      and (event = @event or @event IS NULL)
      and (@date::date = time::date OR @date IS NULL)
      and (type = @type OR @type IS NULL)
    order by camera, event, type, time, frame;
`;

const deleteEventsSql = `
    delete from event_logs
    where (camera = @camera OR @camera IS NULL)
      and (event = @event or @event IS NULL)
      and (@date::date = begin::date OR @date IS NULL);
`;

const deleteEventDataSql = `
    delete from events
    where (camera = @camera OR @camera IS NULL)
      and (event = @event or @event IS NULL)
      and (@date::date = time::date OR @date IS NULL);
`;

const deleteEventsInListSql = `
    delete from events
    where id in ($ids);
`;


module.exports = {
    queryEventsSql,
    queryEventCountSql,
    queryEventDataSql,
    deleteEventsSql,
    deleteEventDataSql,
    deleteEventsInListSql
}