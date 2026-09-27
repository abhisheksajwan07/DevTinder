import { Queue } from "bullmq";
import { IChatRepository } from "../chat/chat.types.js";
import { PresenceService } from "../chat/presence/presence.service.js";
import { logger } from "../../config/logger.js";

export async function notifyOfflineRecipient(
  recipientProfileId: string,
  chatRepository: IChatRepository,
  presenceService: PresenceService,
  emailQueue: Queue,
): Promise<void> {
  const isOnline = await presenceService.isOnline(recipientProfileId);
  if (isOnline) return;

  const jobId = `notify-${recipientProfileId}`;
  const existing = await emailQueue.getJob(jobId);
  if (existing) {
    logger.debug(
      { jobId },
      "[Chat] Offline notification already queued — skipping",
    );
    return;
  }

  const recipient = await chatRepository.getRecipientEmail(recipientProfileId);
  if (!recipient) {
    logger.warn(
      { recipientProfileId },
      "[Chat] Could not resolve recipient email for offline notification",
    );
    return;
  }

  await emailQueue.add(
    "offline-message-notify",
    { email: recipient.email, firstName: recipient.firstName },
    { jobId },
  );

  logger.info(
    { jobId, email: recipient.email },
    "[Chat] Offline notification job enqueued",
  );
}
