
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
    order by $orderby
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
    group by $groupby
`;

const queryEventDataSql = `
    select camera,
           strftime('%Y-%m-%d', time) as date,
           time,
           type,
           id,
           event,
           filename
    from events
    where (camera = @camera OR @camera IS NULL)
      AND (strftime('%Y-%m-%d', @date) = date OR @date IS NULL)
      AND (type = @type OR @type IS NULL)
    order by $orderby
    limit case when @limit is null then 9223372036854775807 else @limit end;
`;

const queryForEventData = `
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
    order by camera, event, type, time, frame;
`;

module.exports = {
    queryEventsSql,
    queryEventCountSql,
    queryEventDataSql,
    queryForEventData
}