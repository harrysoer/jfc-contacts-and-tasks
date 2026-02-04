"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import Card from "@/src/components/Card";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";
import { useRegister } from "@/src/lib/api/auth";

type SignupFormData = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = (data: SignupFormData) => {
    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
        name: data.name || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Successful");
          router.push("/login");
        },
      }
    );
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
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
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
          label="Name"
          type="text"
          {...register("name")}
          error={errors.name?.message}
        />

        <TextInput
          label="Password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={errors.password?.message}
        />

        <TextInput
          label="Confirm Password"
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />

        {registerMutation.error && (
          <p className="text-sm text-red-600">
            {registerMutation.error.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in here
        </Link>
      </p>
    </Card>
  );
}
