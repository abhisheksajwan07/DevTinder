CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "profiles" ADD COLUMN "embedding" vector(1024);

CREATE INDEX IF NOT EXISTS profiles_embedding_hnsw_idx
ON profiles
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);