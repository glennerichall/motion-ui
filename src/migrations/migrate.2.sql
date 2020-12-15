create table if not exists push_subscriptions
(
    id           serial     not null primary key,
    subscription json       not null,
    time         timestamp  not null,
    key          text       not null,
    vapikey      text       not null
);

create unique index if not exists push_subscriptions_id_uindex
    on push_subscriptions (id);