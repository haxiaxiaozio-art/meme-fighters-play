-- Additive migration: run after schema.sql, before deploying the new Edge Function.
begin;
create table if not exists meme_private.analytics_views (
 view_id uuid primary key,
 visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 game_at timestamptz
);
create index if not exists analytics_views_time on meme_private.analytics_views(created_at);
create index if not exists analytics_views_visitor on meme_private.analytics_views(visitor_hash);
create index if not exists analytics_views_game on meme_private.analytics_views(game_at) where game_at is not null;
create table if not exists meme_private.analytics_plays (
 visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
 day date not null,
 primary key(day,visitor_hash)
);
-- Preserve first game clicks if updating a deployment that already has visits.
insert into meme_private.analytics_plays(visitor_hash,day)
 select distinct visitor_hash,(game_at at time zone 'Asia/Singapore')::date
 from meme_private.analytics_views where game_at is not null on conflict do nothing;
create table if not exists meme_private.analytics_limits (
 ip_hash text not null,
 bucket timestamptz not null,
 hits integer not null,
 primary key(ip_hash,bucket)
);
alter table meme_private.analytics_views enable row level security;
alter table meme_private.analytics_limits enable row level security;
alter table meme_private.analytics_plays enable row level security;
revoke all on meme_private.analytics_views,meme_private.analytics_limits,meme_private.analytics_plays from public,anon,authenticated;
grant select,insert,update on meme_private.analytics_views to service_role;
grant select,insert,update,delete on meme_private.analytics_limits to service_role;
grant select,insert on meme_private.analytics_plays to service_role;
insert into meme_private.settings(name,value) values ('analytics_started_at',clock_timestamp()::text)
 on conflict(name) do nothing;

create or replace function public.meme_analytics(
 p_action text, p_payload jsonb default '{}'::jsonb, p_visitor_hash text default null,
 p_ip_hash text default null, p_admin_hash text default null
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 stamp timestamptz := clock_timestamp();
 today date := (stamp at time zone 'Asia/Singapore')::date;
 view_key uuid; event_name text; prior_hash text; hit_count integer;
 period integer; start_stamp timestamptz; first_day date;
 totals jsonb; daily jsonb; today_stats jsonb;
begin
 if p_action='record' then
  if p_visitor_hash is null or p_visitor_hash !~ '^[a-f0-9]{64}$'
   or p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$'
   or coalesce(p_payload->>'viewId','') !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
   or coalesce(p_payload->>'event','') not in ('pageview','game_enter') then
   raise exception 'INVALID_INPUT';
  end if;
  view_key := (p_payload->>'viewId')::uuid;
  event_name := p_payload->>'event';
  -- Short-lived, daily-salted IP hashes only protect this anonymous write endpoint.
  insert into meme_private.analytics_limits(ip_hash,bucket,hits)
   values(p_ip_hash,date_trunc('hour',stamp),1)
   on conflict(ip_hash,bucket) do update set hits=meme_private.analytics_limits.hits+1
   where meme_private.analytics_limits.hits<600 returning hits into hit_count;
  if hit_count is null then raise exception 'RATE_LIMIT'; end if;
  delete from meme_private.analytics_limits where (ip_hash,bucket) in
   (select ip_hash,bucket from meme_private.analytics_limits where bucket<stamp-interval '2 days' limit 100);
  -- Serialize page/game races without creating two pageviews.
  perform pg_advisory_xact_lock(hashtextextended(view_key::text,42));
  select visitor_hash into prior_hash from meme_private.analytics_views where view_id=view_key;
  if found and prior_hash<>p_visitor_hash then raise exception 'REQUEST_CONFLICT'; end if;
  insert into meme_private.analytics_views(view_id,visitor_hash,created_at,game_at)
   values(view_key,p_visitor_hash,stamp,case when event_name='game_enter' then stamp end)
   on conflict(view_id) do update set game_at=coalesce(meme_private.analytics_views.game_at,excluded.game_at);
  if event_name='game_enter' then
   insert into meme_private.analytics_plays(visitor_hash,day) values(p_visitor_hash,today) on conflict do nothing;
  end if;
  return jsonb_build_object('ok',true);
 elsif p_action='admin.stats' then
  if p_admin_hash is null or not exists(select 1 from meme_private.settings where name='admin_key_hash' and value=p_admin_hash) then
   raise exception 'FORBIDDEN';
  end if;
  if coalesce(p_payload->>'days','') not in ('7','30') then raise exception 'INVALID_INPUT'; end if;
  period := (p_payload->>'days')::integer;
  select value::timestamptz into start_stamp from meme_private.settings where name='analytics_started_at';
  first_day := greatest(today-period+1,(start_stamp at time zone 'Asia/Singapore')::date);
  select jsonb_build_object('visitors',count(distinct visitor_hash),'pageviews',count(*),
   'players',count(distinct visitor_hash) filter(where game_at is not null)) into totals from meme_private.analytics_views;
  with dates as (
   select first_day+i as day from generate_series(0,today-first_day) i
  ), events as (
   select (created_at at time zone 'Asia/Singapore')::date as day,visitor_hash,1 as pv,0 as play
    from meme_private.analytics_views where created_at>=first_day::timestamp at time zone 'Asia/Singapore'
   union all
   select day,visitor_hash,0,1 from meme_private.analytics_plays where day>=first_day
  ), counts as (
   select day,count(distinct visitor_hash) visitors,sum(pv) pageviews,
    count(distinct visitor_hash) filter(where play=1) players from events group by day
  ) select jsonb_agg(jsonb_build_object('date',d.day,'visitors',coalesce(c.visitors,0),
   'pageviews',coalesce(c.pageviews,0),'players',coalesce(c.players,0)) order by d.day)
   into daily from dates d left join counts c using(day);
  today_stats := daily->(jsonb_array_length(daily)-1);
  return jsonb_build_object('startedAt',start_stamp,'asOf',stamp,'timezone','Asia/Singapore',
   'today',today_stats,'total',totals,'daily',daily,'days',period);
 end if;
 raise exception 'INVALID_INPUT';
end;
$$;
revoke all on function public.meme_analytics(text,jsonb,text,text,text) from public,anon,authenticated;
grant execute on function public.meme_analytics(text,jsonb,text,text,text) to service_role;
notify pgrst,'reload schema';
commit;
