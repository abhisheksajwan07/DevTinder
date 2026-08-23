import { Router } from "express";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { requireOnboarding } from "../../middleware/onboarding.middleware.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";
import { validate } from "../../middleware/validateBody.js";
import {
  getConversationMessagesController,
  getUserConversationsController,

} from "./chat.controller.js";
import {
  conversationIdParamSchema,
  sendMessageSchema,
} from "./chat.validator.js";

const router = Router();

router.get(
  "/",
  requireAccessAuth,
  requireOnboarding,
  getUserConversationsController,
);

router.get(
  "/:conversationId/messages",
  requireAccessAuth,
  requireOnboarding,
  validate(conversationIdParamSchema, "params"),
  getConversationMessagesController,
);

// router.post(
//   "/:conversationId/messages",
//   requireAccessAuth,
//   requireCsrf,
//   requireOnboarding,
//   validate(conversationIdParamSchema, "params"),
//   validate(sendMessageSchema, "body"),
//   sendMessageController,
// );

export default router;
