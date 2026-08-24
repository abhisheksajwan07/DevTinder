export type SwipeAction = "skip" | "connect";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface SwipeInput {
  targetProfileId: string;

  action: SwipeAction;
}

export interface ConnectionActionInput {
  targetProfileId: string;

  action: "accept" | "reject";
}
