-- Add language_pair_id column to idioms table
ALTER TABLE idioms ADD COLUMN language_pair_id uuid NULL;
-- 必要なら外部キー制約も追加（language_pairs.idへの参照）
-- ALTER TABLE idioms ADD CONSTRAINT fk_language_pair FOREIGN KEY (language_pair_id) REFERENCES language_pairs(id);
