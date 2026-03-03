-- -----------------------------------------------------------------------------
-- Supabase 初期化 SQL
-- このSQLをSupabaseダッシュボードの「SQL Editor」に貼り付けて実行してください
-- -----------------------------------------------------------------------------

-- 1. profiles テーブル（ユーザー情報）
create table public.profiles (
  id uuid references auth.users not null primary key,
  display_name text not null,
  area text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  default_process_costs jsonb default '{}'::jsonb not null
);

-- RLS（Row Level Security）有効化
alter table public.profiles enable row level security;

-- profiles: SELECT (誰でも読める。フィード表示のため)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- profiles: INSERT (新規登録時に自分のIDで作成)
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- profiles: UPDATE (自分のデータだけ編集可能)
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );


-- 2. estimates テーブル（見積もりデータ）
create table public.estimates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  vehicle_size text not null,
  total_price integer not null,
  process_names text[] not null,
  polishing_passes integer not null,
  form_data jsonb not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS有効化
alter table public.estimates enable row level security;

-- estimates: SELECT 
-- (自分のデータは全て読める。他人のデータは is_public = true のみ読める)
create policy "Estimates are viewable by owner or if public."
  on estimates for select
  using ( auth.uid() = user_id or is_public = true );

-- estimates: INSERT (自分のデータとしてのみ作成可能)
create policy "Users can insert their own estimates."
  on estimates for insert
  with check ( auth.uid() = user_id );

-- estimates: UPDATE (自分のデータのみ更新可能)
create policy "Users can update own estimates."
  on estimates for update
  using ( auth.uid() = user_id );

-- estimates: DELETE (自分のデータのみ削除可能)
create policy "Users can delete own estimates."
  on estimates for delete
  using ( auth.uid() = user_id );
