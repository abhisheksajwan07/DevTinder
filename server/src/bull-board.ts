import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { emailQueue } from "./queues/email.queue.js";
import { embeddingQueue } from "./queues/embedding.queue.js";
import { matchingQueue } from "./queues/matching.queue.js";
import { githubSyncQueue } from "./queues/github-sync.queue.js";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(embeddingQueue),
    new BullMQAdapter(matchingQueue),
    new BullMQAdapter(githubSyncQueue),
  ],
  serverAdapter,
});

export { serverAdapter };
