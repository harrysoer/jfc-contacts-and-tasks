"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";

type User = {
  id: number;
  email: string;
  name: string | null;
};

async function fetchCurrentUser(): Promise<User> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export default function UserMenu() {
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <UserCircleIcon className="w-6 h-6" />
        {isLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          <span>{user?.name || user?.email}</span>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
}
