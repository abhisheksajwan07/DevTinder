export type SwipeAction = "skipped" | "interested";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface SwipeActionInput {
  actorProfileId: string;
  targetProfileId: string;
  action: SwipeAction;
  status: ConnectionStatus | null;
}
export interface UpdateConnectionInput {
  actorProfileId: string;
  targetProfileId: string;
  status: "accepted" | "rejected";
}
export type ProfileParams = {
  profileId: string;
};

export interface ProfileActionRecord {
  id: string;
  actorProfileId: string;
  targetProfileId: string;
  action: SwipeAction;
  status: ConnectionStatus | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISwipeRepository {
  // pass(profileId:string,actorProfileId:string):Promise<
  insertAction(input: SwipeActionInput): Promise<ProfileActionRecord>;

  findExistingAction(
    actorProfileId: string,
    targetProfileId: string,
  ): Promise<ProfileActionRecord | null>;

  updateStatus(
    input: UpdateConnectionInput,
  ): Promise<ProfileActionRecord | null>;

  findPendingConnection(
    actorProfileId: string,
    targetProfileId: string,
  ): Promise<ProfileActionRecord | null>;
}

export interface ISwipeService {
  skip(actorProfileId: string, targetProfileId: string): Promise<void>;

  connect(actorProfileId: string, targetProfileId: string): Promise<void>;

  accept(actorProfileId: string, targetProfileId: string): Promise<void>;

  reject(actorProfileId: string, targetProfileId: string): Promise<void>;
}
