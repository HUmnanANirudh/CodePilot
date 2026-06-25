import { useQuery } from "@tanstack/react-query";
import { repositoryApi } from "../api/repository.api";

export function useIndexingStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["indexing-status", jobId],
    queryFn: () => repositoryApi.getAnalysisStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      if (query.state.data?.status === "completed" || query.state.data?.status === "failed") {
        return false;
      }
      return 2000;
    },
  });
}
