import { GitHubApiClient } from "./github.api.js";
import { GitHubRepository } from "./github.repository.js";
import { GitHubService } from "./github.service.js";

const githubApiClient = new GitHubApiClient();
const githubRepository = new GitHubRepository();

export const githubService = new GitHubService(githubRepository);

export { githubApiClient, githubRepository };
