create table if not exists events
(
	id integer not null
		constraint events_pk
			primary key autoincrement,
	camera text not null,
	event int not null,
	time text not null,
	filename text not null
);

create unique index if not exists events_id_uindex
	on events (id);

create table if not exists migrations
(
    id integer not null
        constraint migrations_pk
            primary key autoincrement,
    version      int     not null,
    installation text    not null
);

create unique index if not exists migrations_id_uindex
    on migrations (id);

create unique index if not exists migrations_version_uindex
    on migrations (version);
