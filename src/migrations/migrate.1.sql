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
