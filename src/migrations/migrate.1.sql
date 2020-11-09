create table if not exists events
(
	id integer not null
		constraint events_pk
			primary key autoincrement,
	camera text not null,
	event text not null,
	time text not null,
	type text not null,
	filename text not null
);

create unique index if not exists events_id_uindex
	on events (id);

create unique index if not exists events_event_uindex
    on events (event);

create table if not exists event_logs
(
    id     integer not null
        constraint event_logs_pk
            primary key autoincrement,
    event  text     not null,
    begin  text    not null,
    end    text    not null,
    camera text    not null
);

create unique index if not exists event_logs_id_uindex
    on event_logs (id);

create unique index if not exists event_logs_event_uindex
    on event_logs (event);
