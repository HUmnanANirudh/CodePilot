import { useQuery } from "@tanstack/react-query";
import { repositoryApi } from "../api/repository.api";

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: repositoryApi.getRepositories,
  });
}
