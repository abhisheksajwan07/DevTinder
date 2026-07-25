export interface MatchingJobPayload {
  connectionId: string;
}



export  interface IMatchingRepository {
  createMatchAndConversation(connectionId: string): Promise<void>;
}
