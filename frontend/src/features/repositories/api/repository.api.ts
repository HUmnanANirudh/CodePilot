import { fetcher } from "../../../lib/api-client";
import type { AnalysisResult } from "../../../types";
type Repository = any; // fallback until we fix types.ts

export const repositoryApi = {
  getRepositories: () => fetcher<Repository[]>("/repositories"),
  getRepository: (id: string) => fetcher<Repository>(`/repositories/${id}`),
  analyzeRepository: (repo: string) => fetcher<Repository>("/repositories", {
    method: "POST",
    body: JSON.stringify({ repo }),
  }),
  getAnalysisStatus: (jobId: string) => fetcher<any>(`/v1/status/${jobId}`),
  getResults: (repoId: string) => fetcher<AnalysisResult>(`/v1/results/${repoId}`),
};
