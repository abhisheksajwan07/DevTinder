import { env } from "./env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "./logger.js";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";
export const VOYAGE_EMBEDDING_DIMENSION = 1024;

type VoyageEmbeddingResponse = {
  data: {
    embedding: number[];
  }[];
};

export async function generateEmbedding(text: string): Promise<number[]> {

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: VOYAGE_MODEL,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error(`[Voyage AI HTTP] ${response.status}:${body}`);
    throw new AppError(
      `Voyage AI API error: ${response.status}`,
      502,
      "VOYAGE_API_ERROR",
    );
  }

  const result: VoyageEmbeddingResponse =
    (await response.json()) as VoyageEmbeddingResponse;

  const embedding = result.data?.[0]?.embedding;

  if (!embedding || embedding.length !== VOYAGE_EMBEDDING_DIMENSION) {
    throw new AppError(
      `Voyage AI returned unexpected embedding size:${embedding?.length ?? 0}
        (expected ${VOYAGE_EMBEDDING_DIMENSION})`,
      502,
      "VOYAGE_DIMENSION_MISMATCH",
    );
  }

  return embedding;
  
}
