import { Resend } from "resend";

import { Worker } from "bullmq";
import { bullMQConnection } from "../config/redis.js";
import { env } from "../config/env.js";
import { QUEUE_NAME } from "../queues/email.queue.js";
import { logger } from "../config/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

const getOtpTemplate = (otp: string) => `
  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; border-radius: 10px;">
    <h2 style="color: #E94057;">Welcome to DevTinder! 🔥</h2>
    <p>Please use the following One-Time Password (OTP) to complete your verification process. This code is valid for 10 minutes.</p>
    <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
      ${otp}
    </div>
    <p style="font-size: 12px; color: #777; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
  </div>
`;

export const emailWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    if (job.name === "send-welcome-otp") {
      const { email, otp } = job.data;

      await resend.emails.send({
        from: "DevTinder <onboarding@resend.dev>",
        to: email,
        subject: "Verify your DevTinder Account",
        html: getOtpTemplate(otp),
      });
      logger.info(
        `[Email Worker]: successfully delivered validation code to ${email}`,
      );
    }
  },
  { connection: bullMQConnection, concurrency: 4 },
);

emailWorker.on("failed", (job, err) => {
  logger.error({ err }, `[Email Worker] Job failed: ${job?.id}`);
});

emailWorker.on("completed", (job) => {
  logger.info(`[Worker] Job completed -> ID: ${job.id}| Name: ${job.name}`);
});
