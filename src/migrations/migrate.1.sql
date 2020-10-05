create table if not exists events
(
	id integer not null
		constraint events_pk
			primary key autoincrement,
	camera text not null,
	time text not null,
	filename text not null
);

create unique index if not exists events_id_uindex
	on events (id);

create table if not exists version
(
    id           integer not null
        constraint version_pk
            primary key autoincrement,
    version      int     not null,
    installation text    not null
);

create unique index if not exists version_id_uindex
    on version (id);

create unique index if not exists version_version_uindex
    on version (version);
