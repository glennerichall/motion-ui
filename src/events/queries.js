
/*
 /events                ? date=@date
 /events/:camera        ? date=@date
 */
const queryEventsSql = `
    select camera,
           to_json(begin)#>>'{}' as begin,
           id,
           event,
           to_json(done)#>>'{}' as done
    from event_logs
    where done is not null
      AND (camera = @camera OR @camera IS NULL)
      AND (@date::date = begin::date OR @date IS NULL)
      AND removed = false
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
      AND removed = false
    $groupBy
`;

const queryEventDataSql = `
    select camera,
           to_json(time)#>>'{}' as time,
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
    update event_logs
    set removed=true
    where (camera = @camera OR @camera IS NULL)
      and (event = @event or @event IS NULL)
      and (@date::date = begin::date OR @date IS NULL)
    returning *;
`;


module.exports = {
    queryEventsSql,
    queryEventCountSql,
    queryEventDataSql,
    deleteEventsSql,
}