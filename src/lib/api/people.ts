import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type PersonTag = { tag: { id: string; name: string } };
export type PersonTask = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  business?: { id: string; name: string } | null;
};

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  businessId: string | null;
  business?: { id: string; name: string } | null;
  tags?: PersonTag[];
  _count?: { tags: number; tasks: number };
};

export type CreatePersonInput = {
  firstName: string;
  lastName: string;
  email?: string | null;
  businessId?: string | null;
  tagIds?: string[];
};

export type UpdatePersonInput = Partial<CreatePersonInput>;

type ErrorResponse = { message: string };

async function fetchPeople(): Promise<Person[]> {
  const res = await fetch("/api/people", { credentials: "include" });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

async function createPerson(input: CreatePersonInput): Promise<Person> {
  const res = await fetch("/api/people", {
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

async function updatePerson({
  id,
  ...input
}: UpdatePersonInput & { id: string }): Promise<Person> {
  const res = await fetch(`/api/people/${id}`, {
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

async function deletePerson(id: string): Promise<void> {
  const res = await fetch(`/api/people/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.message);
  }
}

export function usePeople() {
  return useQuery({
    queryKey: ["people"],
    queryFn: fetchPeople,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}
