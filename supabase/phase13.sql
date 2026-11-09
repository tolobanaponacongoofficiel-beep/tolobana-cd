-- Phase 13 : buteurs et lieu pour les matchs saisis par la rédaction
alter table matches add column if not exists home_scorers text check (char_length(home_scorers) <= 600);
alter table matches add column if not exists away_scorers text check (char_length(away_scorers) <= 600);
alter table matches add column if not exists venue text check (char_length(venue) <= 120);
