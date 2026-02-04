import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type BusinessTag = { tag: { id: string; name: string } };
export type BusinessCategory = { category: { id: string; name: string } };
export type BusinessTask = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  person?: { id: string; firstName: string; lastName: string } | null;
};

export type Business = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  people?: { id: string; firstName: string; lastName: string; email: string | null }[];
  tags?: BusinessTag[];
  categories?: BusinessCategory[];
  _count?: { people: number; categories: number; tags: number; tasks: number };
};

export type CreateBusinessInput = {
  name: string;
  description?: string | null;
  tagIds?: string[];
  categoryIds?: string[];
};

export type UpdateBusinessInput = Partial<CreateBusinessInput>;

type ErrorResponse = { message: string };

async function fetchBusinesses(): Promise<Business[]> {
  const res = await fetch("/api/businesses", { credentials: "include" });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const res = await fetch("/api/businesses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

async function updateBusiness({
  id,
  ...input
}: UpdateBusinessInput & { id: string }): Promise<Business> {
  const res = await fetch(`/api/businesses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

async function deleteBusiness(id: string): Promise<void> {
  const res = await fetch(`/api/businesses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
}

export function useBusinesses() {
  return useQuery({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}
