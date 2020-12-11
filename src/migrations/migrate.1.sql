create table  if not exists events
(
    id       serial  not null
        constraint events_pk
            primary key,
    camera   text    not null,
    event    text    not null,
    time     timestamp    not null,
    type     text,
    frame    integer not null,
    filename text    not null
);

create unique index  if not exists events_id_uindex
    on events (id);


create table if not exists event_logs
(
    id     serial not null
        constraint event_logs_pk
            primary key,
    event  text   not null,
    begin  timestamp   not null,
    done  timestamp,
    camera text   not null
);

create unique index if not exists event_logs_id_uindex
    on event_logs (id);
