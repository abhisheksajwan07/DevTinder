import { FeedRepository } from "./feed.repository.js";
import { FeedService } from "./feed.service.js";

export const feedRepository = new FeedRepository();
export const feedService = new FeedService(feedRepository);
