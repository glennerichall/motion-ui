
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
    order by camera, begin;
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
    group by case @groupbycamera when 1 then camera else 1 end, 
             case @groupbydate when 1 then date else 1 end
`;

const queryLastEventSql = `
    select max(begin) as begin,
           id,
           event,
           end,
           camera
    from event_logs
    where end is not null
      and (strftime('%Y-%m-%d', @date) = begin OR
           @date = 'latest' OR
           @date IS NULL)
      and (camera = @camera or @camera is null)
    group by camera,
             case
                 when @date = 'latest' then 1
                 else strftime('%Y-%m-%d', begin)
                 end
`;

module.exports = {
    queryEventsSql,
    queryEventCountSql,
    queryLastEventSql
}