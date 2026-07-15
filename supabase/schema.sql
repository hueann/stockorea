-- ============================================================
-- 스톡코리아 DB 스키마 (Supabase SQL Editor에서 전체 실행)
-- ============================================================

-- 1) 프로필 (회원)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user', -- 'user' | 'admin'
  created_at timestamptz not null default now()
);

-- 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) 콘텐츠
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('music','sfx','video')),
  title text not null,
  title_en text,
  description text,
  category text not null,
  subcategory text,
  mood text,
  tags text[] default '{}',
  duration text,
  bpm int,
  resolution text,
  format text,
  price int not null default 0,          -- 원 단위, 0이면 무료
  preview_path text,                     -- previews 버킷 (공개)
  file_path text not null,               -- originals 버킷 (비공개)
  thumbnail_path text,                   -- previews 버킷 (공개 썸네일)
  license text not null default 'commercial', -- 'commercial' | 'extended'
  status text not null default 'active', -- 'active' | 'hidden' | 'pending'
  downloads int not null default 0,
  created_at timestamptz not null default now()
);
-- 기존 테이블 보강 (재실행 시)
alter table public.assets add column if not exists thumbnail_path text;
alter table public.assets add column if not exists license text not null default 'commercial';

-- 3) 구매
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  asset_id uuid not null references public.assets(id),
  amount int not null,
  status text not null default 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  payment_key text,
  created_at timestamptz not null default now()
);

-- 4) 라이선스
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id),
  user_id uuid not null references public.profiles(id),
  asset_id uuid not null references public.assets(id),
  license_no text not null unique,
  scope text not null default 'commercial',
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS (행 수준 보안)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.purchases enable row level security;
alter table public.licenses enable row level security;

-- 관리자 판별 함수
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: 본인 조회/수정
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- assets: 공개 콘텐츠는 누구나, 관리자는 전체 + 등록/수정
create policy "assets_select" on public.assets for select using (status = 'active' or public.is_admin());
create policy "assets_insert_admin" on public.assets for insert with check (public.is_admin());
create policy "assets_update_admin" on public.assets for update using (public.is_admin());
create policy "assets_delete_admin" on public.assets for delete using (public.is_admin());

-- purchases: 본인 것만 조회, 본인 명의 pending만 생성 (결제 승인은 서버 전용)
create policy "purchases_select_own" on public.purchases for select using (auth.uid() = user_id or public.is_admin());
create policy "purchases_insert_own" on public.purchases for insert
  with check (auth.uid() = user_id and status = 'pending');

-- licenses: 본인 것만 조회 (발급은 서버 전용)
create policy "licenses_select_own" on public.licenses for select using (auth.uid() = user_id or public.is_admin());

-- ============================================================
-- 스토리지 버킷
-- previews: 공개 (미리듣기/미리보기 파일)
-- originals: 비공개 (원본, 서명 URL로만 다운로드)
-- ============================================================
insert into storage.buckets (id, name, public) values ('previews','previews', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('originals','originals', false)
  on conflict (id) do nothing;

create policy "previews_public_read" on storage.objects for select
  using (bucket_id = 'previews');

-- 관리자만 브라우저에서 스토리지에 직접 업로드 (Vercel 본문 제한 우회)
drop policy if exists "originals_admin_insert" on storage.objects;
create policy "originals_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'originals' and public.is_admin());
drop policy if exists "previews_admin_insert" on storage.objects;
create policy "previews_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'previews' and public.is_admin());

-- ============================================================
-- 기업문의 접수 (Business inquiries)
-- 누구나 접수(insert), 조회·상태변경은 관리자만
-- ============================================================
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  company text,
  contact_name text,
  email text,
  phone text,
  message text,
  status text not null default 'pending', -- 'pending' | 'in_progress' | 'done'
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
drop policy if exists "inquiries_insert_any" on public.inquiries;
create policy "inquiries_insert_any" on public.inquiries for insert with check (true);
drop policy if exists "inquiries_select_admin" on public.inquiries;
create policy "inquiries_select_admin" on public.inquiries for select using (public.is_admin());
drop policy if exists "inquiries_update_admin" on public.inquiries;
create policy "inquiries_update_admin" on public.inquiries for update using (public.is_admin());

-- ============================================================
-- 관리자 지정: 가입 후 아래 SQL을 본인 이메일로 실행
-- update public.profiles set role = 'admin' where email = 'hueann1@naver.com';
-- ============================================================
