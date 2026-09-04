alter table companies add column if not exists telegram_chat_id text;
alter table companies add column if not exists telegram_link_code text unique;
