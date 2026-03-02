-- =============================================
-- SunuLamb Database Schema
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================
-- Table: users (profils publics)
-- =============================================
create table if not exists public.users (
    id          uuid references auth.users on delete cascade primary key,
    full_name   text,
    first_name  text,
    last_name   text,
    phone       text unique,
    email       text unique,
    password    text,
    avatar_url  text,
    points      int not null default 0,
    rank        int,
    created_at  timestamptz not null default now()
);

-- Trigger to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, full_name, first_name, last_name, phone, email)
    values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.phone,
        new.email
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- =============================================
-- Table: events
-- =============================================
create table if not exists public.events (
    id              uuid primary key default uuid_generate_v4(),
    title           text not null,
    date            text not null,
    time            text not null,
    month_label     text not null,
    category        text not null,
    category_id     text not null,
    price_vip       int not null default 15000,
    price_tribune   int not null default 5000,
    price_pelouse   int not null default 2000,
    location        text not null,
    address         text,
    image_url       text,
    description     text,
    tag             text,
    status          text not null default 'published' check (status in ('published','cancelled','sold_out')),
    created_at      timestamptz not null default now(),
    promoter        text,
    promoter_logo   text,
    promoter_description text,
    latitude        decimal(10, 8),
    longitude       decimal(11, 8)
);

-- =============================================
-- Table: tickets
-- =============================================
create table if not exists public.tickets (
    id              uuid primary key default uuid_generate_v4(),
    user_id         uuid references public.users on delete cascade not null,
    event_id        uuid references public.events on delete restrict not null,
    zone            text not null check (zone in ('VIP','TRIBUNE','PELOUSE')),
    quantity        int not null default 1 check (quantity > 0),
    total_price     int not null,
    qr_code         text unique not null,
    payment_ref     text,
    payment_method  text,  -- wave | orange | free
    status          text not null default 'pending' check (status in ('pending','confirmed','used','cancelled')),
    created_at      timestamptz not null default now()
);

-- =============================================
-- Table: challenges (défis/pronostics)
-- =============================================
create table if not exists public.challenges (
    id          uuid primary key default uuid_generate_v4(),
    event_id    uuid references public.events on delete cascade,
    title       text not null,
    fighter_1   text not null,
    fighter_2   text not null,
    winner      text,          -- null until result announced
    points      int not null default 300,
    deadline    timestamptz,
    image_url   text,
    created_at  timestamptz not null default now()
);

-- =============================================
-- Table: predictions
-- =============================================
create table if not exists public.predictions (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             uuid references public.users on delete cascade not null,
    challenge_id        uuid references public.challenges on delete cascade not null,
    predicted_winner    text not null,
    is_correct          boolean,       -- set when winner is announced
    points_earned       int default 0,
    created_at          timestamptz not null default now(),
    unique (user_id, challenge_id)    -- one prediction per user per challenge
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.tickets enable row level security;
alter table public.challenges enable row level security;
alter table public.predictions enable row level security;

-- Users: can read own profile, update own profile
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- Admin can view all users
create policy "Allow all on users" on public.users
    for all to anon, authenticated using (true) with check (true);

-- Events: anyone can read published events
create policy "Anyone can view published events" on public.events for select using (status = 'published');

-- Tickets: users can only see their own tickets
create policy "Users can view their own tickets" on public.tickets for select using (auth.uid() = user_id);
create policy "Service role can insert tickets" on public.tickets for insert with check (true);

-- Challenges: anyone can read
create policy "Anyone can view challenges" on public.challenges for select using (true);

-- Predictions: users can read own, insert own
create policy "Users can view their own predictions" on public.predictions for select using (auth.uid() = user_id);
create policy "Users can insert their own predictions" on public.predictions for insert with check (auth.uid() = user_id);

-- =============================================
-- Seed Data — Events
-- =============================================
-- Supprimer les événements existants pour éviter les doublons
DELETE FROM public.events WHERE title IN ('Grand Gala de Lutte', 'Dakar Music Festival', 'Soiree Stand-Up : Rire en Wolof', 'Soiree de Gala VIP', 'Tournoi International de Lutte');

insert into public.events (title, date, time, month_label, category, category_id, price_vip, price_tribune, price_pelouse, location, address, image_url, description, tag, status, promoter, promoter_description, latitude, longitude) values
('Grand Gala de Lutte', '15 MARS - 16:00', '16h00 - 20h00', 'MARS', 'SPORT', 'sport', 15000, 5000, 2000, 'Arene Nationale', 'Pikine, Dakar', '/hero-combat.png', 'Le combat royal le plus attendu de l annee.', 'Grand Combat', 'published', 'CNG de Lutte', 'Le Comité National de Gestion de la Lutte', 14.7167, -17.4677),
('Dakar Music Festival', '22 MARS - 21:00', '21h00 - 04h00', 'MARS', 'MUSIQUE', 'musique', 50000, 25000, 10000, 'Monument de la Renaissance', 'Ouakam, Dakar', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', 'Vivez une nuit magique avec les plus grandes stars.', 'Festival', 'published', 'Dakar Events', 'Organisateur des plus grands festivals au Sénégal', 14.6928, -17.4467),
('Soiree Stand-Up : Rire en Wolof', '28 MARS - 20:00', '20h00 - 23h00', 'MARS', 'HUMOUR', 'humour', 20000, 10000, 5000, 'Theatre Daniel Sorano', 'Plateau, Dakar', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80', 'Les meilleurs humoristes reunis pour une soiree de rires.', 'One Man Show', 'published', 'Jelani', 'Jelani est l evenement incontournable de l ete au Senegal, alliant ambiance festive et plaisirs culinaires.', 14.7167, -17.4677),
('Soiree de Gala VIP', '05 AVRIL - 19:30', '19h30 - 23h30', 'AVRIL', 'LOISIRS', 'loisirs', 100000, 50000, 20000, 'Hotel Terrou-Bi', 'Corniche Ouest, Dakar', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', 'Soiree d exception reunissant decideurs et personnalites.', 'Prestige', 'published', 'Prestige Events', 'Organisateur d evenements haut de gamme', 14.6928, -17.4467),
('Tournoi International de Lutte', '15 JUIN - 15:00', '15h00 - 21h00', 'JUIN', 'SPORT', 'sport', 20000, 10000, 5000, 'Arene Nationale', 'Pikine, Dakar', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80', 'Tournoi international reunissant les meilleurs lutteurs.', 'Tournoi', 'published', 'Faynar', 'Faynar est l evenement incontournable de l ete au Senegal, alliant ambiance festive et plaisirs culinaires.', 14.7167, -17.4677);

-- =============================================
-- Storage Buckets
-- =============================================
-- Créer le bucket pour les images d'événements s'il n'existe pas
insert into storage.buckets (id, name, public) 
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Politique pour permettre l'upload d'images (authentifié ou anonyme)
create policy "Allow public uploads" on storage.objects
    for insert to public with check (bucket_id = 'event-images');

-- Politique pour permettre la lecture publique des images
create policy "Allow public read" on storage.objects
    for select to public using (bucket_id = 'event-images');

-- =============================================
-- Table: settings (configuration du site)
-- =============================================
create table if not exists public.settings (
    id              uuid primary key default uuid_generate_v4(),
    setting_key     text unique not null,
    setting_value   jsonb not null default '{}',
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Insérer les paramètres par défaut
insert into public.settings (setting_key, setting_value) values
('site', '{"name": "SunuLamb", "email": "contact@sunulamb.sn", "phone": "+221 77 123 45 67", "address": "Dakar, Sénégal", "logo_url": "/logo-sunulamb.png", "facebook_url": "https://facebook.com/sunulamb", "instagram_url": "https://instagram.com/sunulamb", "twitter_url": "https://twitter.com/sunulamb"}'),
('payment', '{"wave_enabled": true, "orange_enabled": true, "free_enabled": true, "card_enabled": false, "fee_percentage": 3, "min_amount": 500, "max_amount": 1000000}'),
('notifications', '{"email_notifications": true, "sms_notifications": true, "push_notifications": false, "order_confirmation": true, "promotional": false, "event_reminders": true}'),
('security', '{"two_factor_enabled": false, "session_timeout": 30, "login_attempts": 5}')
on conflict (setting_key) do nothing;

-- Activer RLS
alter table public.settings enable row level security;

-- Politiques RLS pour settings
create policy "Allow public read on settings" on public.settings
    for select to anon, authenticated using (true);

create policy "Allow insert on settings" on public.settings
    for insert to anon, authenticated with check (true);

create policy "Allow update on settings" on public.settings
    for update to anon, authenticated using (true) with check (true);

-- =============================================
-- Table: payments (transactions)
-- =============================================
create table if not exists public.payments (
    id              uuid primary key default uuid_generate_v4(),
    transaction_id  text unique not null default 'TRX' || to_char(now(), 'YYMMDDHH24MISS') || lpad(floor(random() * 10000)::text, 4, '0'),
    user_id         uuid references public.users(id) on delete set null,
    event_id        uuid references public.events(id) on delete set null,
    ticket_id       uuid references public.tickets(id) on delete set null,
    amount          decimal(12, 2) not null,
    fee             decimal(12, 2) not null default 0,
    net_amount      decimal(12, 2) generated always as (amount - fee) stored,
    payment_method  text not null check (payment_method in ('wave', 'orange', 'free', 'card')),
    status          text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
    phone_number    text,
    payment_reference text,
    metadata        jsonb,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Index pour les requêtes fréquentes
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_event_id on public.payments(event_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

-- Activer RLS
alter table public.payments enable row level security;

-- Politiques RLS pour payments
create policy "Allow public read on payments" on public.payments
    for select to anon, authenticated using (true);

create policy "Allow insert on payments" on public.payments
    for insert to anon, authenticated with check (true);

create policy "Allow update on payments" on public.payments
    for update to anon, authenticated using (true) with check (true);

-- Trigger pour mettre à jour updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_payments_updated_at on public.payments;
create trigger update_payments_updated_at
    before update on public.payments
    for each row execute function update_updated_at_column();

-- =============================================
-- Données de test pour payments
-- =============================================
insert into public.payments (user_id, event_id, amount, fee, payment_method, status, phone_number) values
((select id from public.users limit 1), (select id from public.events limit 1), 15000, 450, 'wave', 'completed', '771234567'),
((select id from public.users offset 1 limit 1), (select id from public.events limit 1), 5000, 150, 'orange', 'completed', '772345678'),
((select id from public.users offset 2 limit 1), (select id from public.events offset 1 limit 1), 50000, 1500, 'wave', 'pending', '773456789'),
((select id from public.users offset 3 limit 1), (select id from public.events offset 2 limit 1), 25000, 750, 'free', 'completed', '774567890'),
((select id from public.users offset 4 limit 1), (select id from public.events limit 1), 10000, 300, 'card', 'failed', '775678901');

