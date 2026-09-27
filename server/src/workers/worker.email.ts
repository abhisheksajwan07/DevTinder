import { Resend } from "resend";

import { Worker } from "bullmq";
import { bullMQConnection } from "../config/redis.js";
import { env } from "../config/env.js";
import { QUEUE_NAME } from "../queues/email.queue.js";
import { logger } from "../config/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

const getOtpTemplate = (otp: string) => `
  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; border-radius: 10px;">
    <h2 style="color: #E94057;">Welcome to DevTinder! </h2>
    <p>Please use the following One-Time Password (OTP) to complete your verification process. This code is valid for 10 minutes.</p>
    <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
      ${otp}
    </div>
    <p style="font-size: 12px; color: #777; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
  </div>
`;

const getResetPasswordTemplate = (resetUrl: string) => `
  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; border-radius: 10px;">
    <h2 style="color: #E94057;">Reset your DevTinder Password 🔐</h2>
    <p>Click the button below to reset your password. This link is valid for 15 minutes.</p>
    <a href="${resetUrl}" style="display: inline-block; background: #E94057; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
      Reset Password
    </a>
    <p style="font-size: 12px; color: #777; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

const getOfflineMessageTemplate = (firstName: string) => `
  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; border-radius: 10px;">
    <h2 style="color: #E94057;">You have a new message on DevTinder 💬</h2>
    <p>Hey ${firstName}, someone sent you a message while you were away!</p>
    <p>Log back in to continue the conversation and find your next dev collaborator.</p>
    <a href="https://devtinder.abhishekbytes.space/chat" style="display: inline-block; background: #E94057; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
      View Message
    </a>
    <p style="font-size: 12px; color: #777; margin-top: 20px;">You are receiving this because you have notifications enabled on DevTinder.</p>
  </div>
`;

export const emailWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    if (job.name === "send-welcome-otp") {
      const { email, otp } = job.data;

      await resend.emails.send({
        from: "DevTinder <noreply@devtinder.abhishekbytes.space>",
        to: email,
        subject: "Verify your DevTinder Account",
        html: getOtpTemplate(otp),
      });
      logger.info(
        `[Email Worker]: successfully delivered validation code to ${email}`,
      );
    }

    if (job.name === "send-reset-password") {
      const { email, resetUrl, idempotencyKey } = job.data;
      await resend.emails.send(
        {
          from: "DevTinder <noreply@devtinder.abhishekbytes.space>",
          to: email,
          subject: "Reset your DevTinder Password",
          html: getResetPasswordTemplate(resetUrl),
        },
        {
          idempotencyKey,
        },
      );
      logger.info(`[Email Worker]: reset password email delivered to ${email}`);
    }

    if (job.name === "offline-message-notify") {
      const { email, firstName } = job.data;
      await resend.emails.send({
        from: "DevTinder <noreply@devtinder.abhishekbytes.space>",
        to: email,
        subject: "You have a new message on DevTinder ",
        html: getOfflineMessageTemplate(firstName),
      });
      logger.info(
        `[Email Worker]: offline message notification delivered to ${email}`,
      );
    }
  },
  {
    connection: bullMQConnection,
    concurrency: 4,
    limiter: {
      max: 8,
      duration: 1000,
    },
  },
);

emailWorker.on("failed", (job, err) => {
  logger.error({ err }, `[Email Worker] Job failed: ${job?.id}`);
});

emailWorker.on("completed", (job) => {
  logger.info(`[Worker] Job completed -> ID: ${job.id}| Name: ${job.name}`);
});
