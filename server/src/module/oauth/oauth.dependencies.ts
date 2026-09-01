import { OAuthRepository } from "./oauth.repository.js";
import { OAuthService } from "./oauth.service.js";

import { sessionService } from "../session/session.dependencies.js";
export const oauthRepository = new OAuthRepository();
export const oauthService = new OAuthService(oauthRepository, sessionService);
