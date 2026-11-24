# Kissan Mithar Agricultural Knowledge Engine (RAG)
## Retrieval-Augmented Generation Architecture with PostgreSQL pgvector

---

### 1. Architectural Overview

To eliminate LLM hallucinations and provide legally and agronomically verifiable advice, Kissan Mithar implements a **Domain-Specific Agricultural RAG Pipeline**:

```
[Official Agricultural Sources]
 - ICAR Handbooks
 - State Agri Universities (PJTSAU, ANGRAU, TNAU, UAS)
 - Krishi Vigyan Kendra (KVK) Advisory Bulletins
 - CIBRC Insecticide & Fungicide Registers
                   |
                   v
         [Document Ingestion]
  (PDF / Markdown / HTML Clean & Normalize)
                   |
                   v
       [Semantic Text Chunker]
(500-token chunks with 100-token overlap + Metadata)
                   |
                   v
      [Embedding Model Generator]
 (Gemini text-embedding-004: 768 Dimensions)
                   |
                   v
+-------------------------------------------------+
|          SUPABASE POSTGRESQL + PGVECTOR         |
|  - Table: knowledge_chunks                      |
|  - Index: HNSW (Cosine Distance)                |
|  - Metadata Filter: Crop, State, Season, Category|
+-------------------------------------------------+
                   |
   User Query ---->+----> Hybrid Vector Search (Cosine >= 0.78)
                                |
                                v
               [Context Grounding & Prompt Builder]
                                |
                                v
                   [LLM Synthesizer (Gemini / GPT-4o)]
                                |
                                v
             Verified Answer with Citation & Source
```

---

### 2. Knowledge Corpus Hierarchy & Sources

1. **Crop Cultivation & Agronomy:** Official Package of Practices (PoP) published by State Agricultural Universities (SAUs).
2. **Crop Protection & Pest Management:** CIBRC (Central Insecticide Board and Registration Committee) approved chemicals and dosages.
3. **Organic Farming:** National Centre for Organic Farming (NCOF) standards (Jeevamrutha, Neem oil, Trichoderma viride).
4. **Soil & Nutrient Management:** Soil Health Card Scheme technical guidelines.
5. **Government Schemes & Subsidies:** Direct benefit transfer portals (PM-KISAN, Rythu Bandhu, PMKSY Drip Irrigation, PMFBY).

---

### 3. Chunking & Ingestion Strategy

```typescript
export interface IngestionChunk {
  documentId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    crop: string[];
    state: string;
    season: 'KHARIF' | 'RABI' | 'ZAID' | 'ALL';
    topic: 'PEST' | 'FERTILIZER' | 'IRRIGATION' | 'SCHEME';
    sourceName: string;
    publicationYear: number;
  };
  embedding?: number[];
}
```

* **Chunk Size:** 512 tokens with 64-token sliding window overlap to preserve semantic continuity across sentences.
* **Metadata Enrichment:** Every chunk is tagged with crop keywords, state jurisdiction, and category, enabling **Hybrid Filtered Search** (filtering by crop before computing cosine similarity).

---

### 4. Vector Retrieval & Similarity Search Query

In the backend service (`backend/src/services/rag.service.ts`), retrieval executes via raw PostgreSQL query over `pgvector`:

```sql
SELECT 
    kc.id,
    kc.content,
    kc.metadata,
    kd.title as document_title,
    kd.source_name,
    kd.source_url,
    1 - (kc.embedding <=> $1::vector) as similarity
FROM knowledge_chunks kc
JOIN knowledge_documents kd ON kd.id = kc.document_id
WHERE 
    ($2::text IS NULL OR $2 = ANY(kd.applicable_crops))
    AND ($3::text IS NULL OR kd.applicable_state = $3 OR kd.applicable_state = 'All India')
    AND (1 - (kc.embedding <=> $1::vector)) >= 0.75
ORDER BY kc.embedding <=> $1::vector ASC
LIMIT 4;
```

---

### 5. Grounding & Anti-Hallucination Guardrails

1. **Strict Context Adherence:** The LLM prompt enforces: *"You are an agricultural advisor. Use ONLY the provided verified context to answer the farmer's question. If the dosage or solution is not in the text, politely tell the farmer to consult a local Krishi Vigyan Kendra specialist rather than guessing."*
2. **Source Attribution:** Every advisory response cites:
   * *Source University / Institute*
   * *Publication Year*
   * *CIBRC Active Ingredient registration code*
