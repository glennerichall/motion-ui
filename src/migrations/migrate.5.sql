alter table events
    rename column time to begin;

alter table events
    add done timestamp;

alter table event_logs
    drop column done;

alter table event_logs
    rename column begin to time;
