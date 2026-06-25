import { useQuery } from "@tanstack/react-query";
import { repositoryApi } from "../api/repository.api";

export function useRepository(repoId: string) {
  return useQuery({
    queryKey: ["repository", repoId],
    queryFn: () => repositoryApi.getRepository(repoId),
    enabled: !!repoId,
  });
}
