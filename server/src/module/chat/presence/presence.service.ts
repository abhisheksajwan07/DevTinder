import { PresenceRepository } from "./presence.repository.js";
import { PresenceState } from "./presence.types.js";

export class PresenceService {
  constructor(private presenceRepo: PresenceRepository) {}

  async connect(profileId: string, socketId: string): Promise<PresenceState> {
    const count = await this.presenceRepo.addSocket(profileId, socketId);
    return {
      profileId,
      isOnline: count === 1,
    };
  }

  async disConnect(
    profileId: string,
    socketId: string,
  ): Promise<PresenceState> {
    const count = await this.presenceRepo.removeSocket(profileId, socketId);
    return {
      profileId,
      isOnline: count > 0,
    };
  }

  async isOnline(profileId: string): Promise<boolean> {
    const count = await this.presenceRepo.getSocketCount(profileId);
    return count > 0;
  }

  async getOnlineStatuses(
    profileIds: string[],
  ): Promise<Record<string, boolean>> {
    return this.presenceRepo.getOnlineStatuses(profileIds);
  }

  async clearAllPresenceKeys(): Promise<void> {
    return this.presenceRepo.clearAllPresenceKeys();
  }
}
