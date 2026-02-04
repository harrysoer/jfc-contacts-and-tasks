"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Card from "@/src/components/Card";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";
import { useLogin } from "@/src/lib/api/auth";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push("/tasks");
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/jblogo.png"
          alt="Logo"
          width={80}
          height={80}
          className="mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
        />

        <TextInput
          label="Password"
          type="password"
          {...register("password", {
            required: "Password is required",
          })}
          error={errors.password?.message}
        />

        {loginMutation.error && (
          <p className="text-sm text-red-600">{loginMutation.error.message}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </Card>
  );
}
