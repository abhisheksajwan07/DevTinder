import { IMatchingRepository } from "./match.types.js";

export class MatchService {
  constructor(private readonly repository: IMatchingRepository) {}

  getMatches(profileId: string) {
    return this.repository.getMatches(profileId);
  }
}
