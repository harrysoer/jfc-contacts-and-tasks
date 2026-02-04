import { useMutation } from "@tanstack/react-query";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

type AuthResponse = {
  id: number;
  email: string;
  name: string | null;
};

type ErrorResponse = {
  message: string;
};

async function login(input: LoginInput): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
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

async function register(input: RegisterInput): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
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

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}
