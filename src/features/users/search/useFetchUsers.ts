import { useMemo } from "react";
import { useFetch } from "@/hooks/useFetch";
import {
  UserSearchResponse,
  UserSearchFilter,
} from "@/app/(users)/api/users/schema";

interface UseFetchUsersProps {
  name?: string;
  contact?: string;
  birthDate?: string;
  locationId?: number;
  filter?: UserSearchFilter;
  page?: number;
  limit?: number;
}

export default function useFetchUsers({
  name,
  contact,
  birthDate,
  locationId,
  filter = "ALL",
  page = 1,
  limit = 20,
}: UseFetchUsersProps = {}) {
  const url = useMemo(() => {
    const params = new URLSearchParams();

    if (name) params.set("name", name);
    if (contact) params.set("contact", contact);
    if (birthDate) params.set("birthDate", new Date(birthDate).toISOString());
    if (locationId !== undefined)
      params.set("locationId", locationId.toString());
    if (filter) params.set("filter", filter);
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    return `/api/users?${params.toString()}`;
  }, [name, contact, birthDate, locationId, filter, page, limit]);

  const { data, loading, error, refetch } = useFetch<UserSearchResponse>(url);

  return {
    users: data?.data || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    refetch,
  };
}
