
/*
 /events                ? date=@date
 /events/:camera        ? date=@date
 */
const queryEventsSql = `
    select camera,
           strftime('%Y-%m-%d', begin) as date,
           begin,
           id,
           event,
           end
    from event_logs
    where end is not null
      AND (camera = @camera OR @camera IS NULL)
      AND (strftime('%Y-%m-%d', @date) = date OR @date IS NULL)
    order by $orderBy
    limit case when @limit is null then 9223372036854775807 else @limit end;
`;

/*
 /events/count          ? date=@date & groupby=camera,date
 /events/:camera/count  ? date=@date & groupby=date
*/
const queryEventCountSql = `
    select camera,
           count(distinct event)       as total,
           strftime('%Y-%m-%d', begin) as date
    from event_logs
    where end is not null
      AND (camera = @camera OR @camera IS NULL)
      AND (strftime('%Y-%m-%d', @date) = date OR @date IS NULL)
    group by $groupBy
`;

const queryEventDataSql = `
    select camera,
           strftime('%Y-%m-%d', time) as date,
           time,
           type,
           id,
           event,
           filename,
           frame
    from events
    where (camera = @camera OR @camera IS NULL)
        and (event = @event or @event IS NULL)
        and (strftime('%Y-%m-%d', @date) = date OR @date IS NULL)
        and (type = @type OR @type IS NULL)
    order by camera, event, type, time, frame;
`;

const deleteEventsSql = `
    delete from event_logs
    where (camera = @camera OR @camera IS NULL)
      and (event = @event or @event IS NULL)
      and (strftime('%Y-%m-%d', @date) = strftime('%Y-%m-%d', begin) OR @date IS NULL);
`;

const deleteEventDataSql = `
    delete from events
    where (camera = @camera OR @camera IS NULL)
      and (event = @event or @event IS NULL)
      and (strftime('%Y-%m-%d', @date) = strftime('%Y-%m-%d', time) OR @date IS NULL);
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