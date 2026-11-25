-- ScannBook database schema. Run once in the SQL Editor of a new Supabase project.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.books (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  isbn13 text not null,
  title text not null,
  subtitle text null,
  authors text[] not null default '{}'::text[],
  publisher text null,
  -- Google Books returns partial dates such as "1890"
  published_date text null,
  page_count integer null,
  -- HTML from Google Books, sanitised at display time
  description text null,
  cover_url text null,
  language text null,
  google_books_id text null,
  status text not null default 'to_read',
  current_page integer null,
  started_at date null,
  finished_at date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_pkey primary key (id),
  constraint books_user_isbn_unique unique (user_id, isbn13),
  constraint books_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  -- Always ISBN-13 so the same book cannot be added twice under its ISBN-10
  constraint books_isbn13_check check (isbn13 ~ '^[0-9]{13}$'),
  constraint books_page_count_check check (page_count > 0),
  constraint books_current_page_check check (current_page >= 0),
  constraint books_status_check check (status in ('wishlist', 'to_read', 'reading', 'read', 'abandoned')),
  constraint books_dates_check check (finished_at is null or started_at is null or finished_at >= started_at),
  constraint books_progress_check check (page_count is null or current_page is null or current_page <= page_count)
);

create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

-- New tables are no longer exposed to the API automatically. We need to explicitly grant permissions to the authenticated role.
revoke all on public.books from anon, authenticated;
grant select, insert, update, delete on public.books to authenticated;

alter table public.books enable row level security;

create policy "Users can read their own books" on public.books
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users can add their own books" on public.books
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users can update their own books" on public.books
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users can delete their own books" on public.books
  for delete to authenticated using ((select auth.uid()) = user_id);