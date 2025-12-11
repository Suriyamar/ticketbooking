-- add_description_to_shows.sql
ALTER TABLE public.shows
ADD COLUMN IF NOT EXISTS description text;
