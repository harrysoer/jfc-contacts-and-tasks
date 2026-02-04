import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  _count?: { businesses: number };
};

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = {
  name: string;
};

type ErrorResponse = { message: string };

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories", { credentials: "include" });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const res = await fetch("/api/categories", {
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

async function updateCategory({
  id,
  ...input
}: UpdateCategoryInput & { id: string }): Promise<Category> {
  const res = await fetch(`/api/categories/${id}`, {
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

async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
