begin;
create schema if not exists meme_private;
create table if not exists meme_private.settings (name text primary key, value text not null);
create table if not exists meme_private.visitors (
 id uuid primary key default gen_random_uuid(), token_hash text not null unique,
 ip_hash text not null, created_at bigint not null, expires_at bigint not null
);
create index if not exists visitors_ip_time on meme_private.visitors(ip_hash,created_at);
create table if not exists meme_private.comments (
 id bigint generated always as identity primary key, request_key uuid not null unique,
 nickname text not null check(char_length(nickname) between 1 and 20),
 body text not null check(char_length(body) between 2 and 600),
 category text not null check(category in ('experience','balance','bug','other')),
 rating smallint check(rating between 1 and 5), is_public boolean not null default true,
 visitor_id uuid not null, ip_hash text not null, created_at bigint not null,
 moderated_at bigint
);
create index if not exists comments_visible_id on meme_private.comments(is_public,id desc);
create index if not exists comments_visitor_time on meme_private.comments(visitor_id,created_at);
create index if not exists comments_ip_time on meme_private.comments(ip_hash,created_at);
alter table meme_private.settings enable row level security;
alter table meme_private.visitors enable row level security;
alter table meme_private.comments enable row level security;
revoke all on schema meme_private from public,anon,authenticated;
revoke all on all tables in schema meme_private from public,anon,authenticated;
grant usage on schema meme_private to service_role;
grant select on meme_private.settings to service_role;
grant select,insert,delete on meme_private.visitors to service_role;
grant select,insert,update on meme_private.comments to service_role;
grant usage,select on all sequences in schema meme_private to service_role;

create or replace function public.meme_feedback(
 p_action text, p_payload jsonb default '{}'::jsonb, p_token_hash text default null,
 p_ip_hash text default null, p_admin_hash text default null
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 now_ms bigint := (extract(epoch from clock_timestamp())*1000)::bigint;
 v_id uuid; c meme_private.comments%rowtype; result_rows jsonb; stats jsonb;
 is_admin boolean := p_action like 'admin.%'; page_limit int; cursor_id bigint;
 category_filter text; next_cursor bigint; candidate_hash text;
begin
 if is_admin and (p_admin_hash is null or not exists(select 1 from meme_private.settings where name='admin_key_hash' and value=p_admin_hash)) then
  raise exception 'FORBIDDEN';
 end if;
 if p_action='session' then
  if exists(select 1 from meme_private.visitors where token_hash=p_token_hash and expires_at>now_ms) then return jsonb_build_object('existing',true); end if;
  if p_ip_hash is null then raise exception 'INVALID_INPUT'; end if;
  perform pg_advisory_xact_lock(hashtextextended('session:'||p_ip_hash,0));
  if (select count(*) from meme_private.visitors where ip_hash=p_ip_hash and created_at>now_ms-3600000)>=120 then raise exception 'RATE_LIMIT'; end if;
  candidate_hash:=p_payload->>'candidateHash';
  if candidate_hash is null or candidate_hash !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_INPUT'; end if;
  delete from meme_private.visitors where id in (select id from meme_private.visitors where expires_at<now_ms limit 100);
  insert into meme_private.visitors(token_hash,ip_hash,created_at,expires_at) values(candidate_hash,p_ip_hash,now_ms,now_ms+604800000);
  return jsonb_build_object('existing',false);
 elsif p_action='create' then
  select id into v_id from meme_private.visitors where token_hash=p_token_hash and expires_at>now_ms;
  if v_id is null then raise exception 'SESSION_EXPIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended('visitor:'||v_id::text,0));
  select * into c from meme_private.comments where request_key=(p_payload->>'requestKey')::uuid;
  if found then
   if c.visitor_id<>v_id then raise exception 'REQUEST_CONFLICT'; end if;
  else
   perform pg_advisory_xact_lock(hashtextextended('comment-ip:'||p_ip_hash,0));
   if exists(select 1 from meme_private.comments where (visitor_id=v_id and created_at>now_ms-30000) or (ip_hash=p_ip_hash and created_at>now_ms-10000))
    or (select count(*) from meme_private.comments where ip_hash=p_ip_hash and created_at>now_ms-3600000)>=120 then raise exception 'RATE_LIMIT'; end if;
   insert into meme_private.comments(request_key,nickname,body,category,rating,visitor_id,ip_hash,created_at)
    values((p_payload->>'requestKey')::uuid,p_payload->>'nickname',p_payload->>'body',p_payload->>'category',(p_payload->>'rating')::smallint,v_id,p_ip_hash,now_ms) returning * into c;
  end if;
  return jsonb_build_object('comment',jsonb_build_object('id',c.id,'nickname',c.nickname,'body',c.body,'category',c.category,'rating',c.rating,'createdAt',c.created_at));
 elsif p_action='list' or p_action='admin.list' then
  page_limit:=case when is_admin then 100 else 20 end;
  cursor_id:=nullif(p_payload->>'cursor','')::bigint;
  category_filter:=p_payload->>'category';
  select coalesce(jsonb_agg(x.obj order by x.id desc),'[]'::jsonb) into result_rows from (
   select id,jsonb_build_object('id',id,'nickname',nickname,'body',body,'category',category,'rating',rating,'createdAt',created_at)||
    case when is_admin then jsonb_build_object('isPublic',case when is_public then 1 else 0 end) else '{}'::jsonb end as obj
   from meme_private.comments where (is_admin or is_public) and (cursor_id is null or id<cursor_id)
    and (is_admin or category_filter is null or category_filter='all' or category=category_filter)
   order by id desc limit page_limit+1
  ) x;
  if jsonb_array_length(result_rows)>page_limit then result_rows:=result_rows-page_limit;next_cursor:=(result_rows->(page_limit-1)->>'id')::bigint; end if;
  if is_admin then
   select jsonb_build_object('total',count(*),'visible',count(*) filter(where is_public),'averageRating',round(avg(rating),1)) into stats from meme_private.comments;
  else
   select jsonb_build_object('total',count(*),'averageRating',round(avg(rating),1),'ratings',count(rating),'bugs',count(*) filter(where category='bug')) into stats from meme_private.comments where is_public;
  end if;
  return jsonb_build_object('comments',result_rows,'nextCursor',next_cursor,'summary',stats);
 elsif p_action='admin.moderate' then
  if (p_payload->>'isPublic') not in ('0','1') or p_payload->>'isPublic' is null then raise exception 'INVALID_INPUT'; end if;
  update meme_private.comments set is_public=(p_payload->>'isPublic')='1',moderated_at=now_ms where id=(p_payload->>'id')::bigint;
  if not found then raise exception 'NOT_FOUND'; end if;
  return jsonb_build_object('ok',true);
 else raise exception 'UNKNOWN_ACTION';
 end if;
end;
$$;
revoke all on function public.meme_feedback(text,jsonb,text,text,text) from public,anon,authenticated;
grant execute on function public.meme_feedback(text,jsonb,text,text,text) to service_role;
commit;
