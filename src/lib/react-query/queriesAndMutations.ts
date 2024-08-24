import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { INewUser } from "@/types";
import { createUserAccount } from "@/lib/appwrite/api.ts";

export const useCreateUserAccountMutation = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};
