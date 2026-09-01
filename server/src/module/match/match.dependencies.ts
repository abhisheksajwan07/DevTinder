import { MatchRepository } from "./match.repository.js";
import { MatchService } from "./match.service.js";

export const matchRepository = new MatchRepository();
export const matchService = new MatchService(matchRepository);
