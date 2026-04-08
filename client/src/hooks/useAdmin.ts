import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function useAdmin(redirectIfNot = true) {
  const { data, isLoading } = trpc.admin.check.useQuery();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !data?.isAdmin && redirectIfNot) {
      navigate("/login");
    }
  }, [data, isLoading, redirectIfNot, navigate]);

  return {
    isAdmin: data?.isAdmin ?? false,
    isLoading,
  };
}
