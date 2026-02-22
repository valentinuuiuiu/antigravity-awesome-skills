# Smart Ad Ingestion Pipeline Design

## Goals
1. **Decoupled Processing:** API returns 200 OK immediately; heavy lifting happens in worker.
2. **Real Intelligence:** Multi-stage AI processing (Safety -> Enhancement -> Pricing).
3. **Asset Management:** Robust image processing with retries.
4. **Visibility:** Database status updates at each stage.

## Architecture

**1. Producer (Next.js API Route)**
- Receives `FormData`.
- Validates basic fields.
- Uploads *raw* images to MinIO (fast).
- Creates DB record with status `processing`.
- Adds job to `ad-ingestion-queue` (Redis/BullMQ).
- Returns `{ success: true, id: <id> }`.

**2. Consumer (Worker Process)**
- Listens on `ad-ingestion-queue`.
- **Step 1: Asset Optimization**
  - Download raw images.
  - Resize/Compress/Generate Thumbnails.
  - Upload optimized assets to MinIO.
  - Update DB: `images` field.
- **Step 2: Content Analysis (DeepSeek)**
  - Vision Analysis: Check for prohibited content, extracting text.
  - Text Analysis: Safety check, scam detection.
- **Step 3: Intelligence Enhancement**
  - **SEO:** Generate better title/description.
  - **Categorization:** Verify/Suggest correct category.
  - **Pricing:** Compare with similar ads (if data available).
- **Step 4: Finalize**
  - Update DB: `status` -> `active` (if safe) or `rejected`.
  - Send Notification (Email/Telegram).

## Tech Stack
- **Queue:** BullMQ (on Redis).
- **Worker:** Node.js process (managed by PM2).
- **AI:** DeepSeek API.
- **Storage:** MinIO.
- **DB:** PostgreSQL.

## Implementation Plan (Subagents)
1. **Infra:** Install `bullmq`, setup `src/lib/queue.ts`.
2. **Worker:** Create `workers/ad-processor.ts`.
3. **API:** Update `route.ts` to dispatch jobs.
4. **PM2:** Register worker process.
