create unique index event_logs_camera_event_uindex
    on event_logs (camera, event);

alter table event_logs
add removed bool default false;

alter table events
    add constraint events_event_logs_camera_event_fk
        foreign key (camera, event) references event_logs (camera, event)
    on delete cascade;