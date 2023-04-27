drop table if exists push_subscriptions;

alter table event_logs
    add motion_width int;

alter table event_logs
    add motion_height int;

alter table event_logs
    add motion_cx int;

alter table event_logs
    add motion_cy int;

alter table event_logs
    add changed_pixels int;

alter table event_logs
    add threshold int;

alter table event_logs
    add noise_level int;

alter table event_logs
    add labels int;
