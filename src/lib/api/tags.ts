import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Tag = {
  id: string;
  name: string;
  createdAt: string;
  _count?: { businesses: number; people: number };
};

export type CreateTagInput = {
  name: string;
};

export type UpdateTagInput = {
  name: string;
};

type ErrorResponse = { message: string };

async function fetchTags(): Promise<Tag[]> {
  const res = await fetch("/api/tags", { credentials: "include" });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

async function createTag(input: CreateTagInput): Promise<Tag> {
  const res = await fetch("/api/tags", {
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

async function updateTag({
  id,
  ...input
}: UpdateTagInput & { id: string }): Promise<Tag> {
  const res = await fetch(`/api/tags/${id}`, {
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

async function deleteTag(id: string): Promise<void> {
  const res = await fetch(`/api/tags/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
