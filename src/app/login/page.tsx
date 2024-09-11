"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loader from "@/components/atoms/Loader";
import { actionLoginUser } from "@/lib/server-action/auth-actions";

const LoginFormSchema = z.object({
  email: z.string().describe("Email").email({ message: "Invalid Email" }),
  password: z.string().describe("Password").min(1, "Password is required"),
});

export default function Login() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof LoginFormSchema>> = async (
    formData
  ) => {
    const { error } = await actionLoginUser(formData.email, formData.password);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    } else {
      location.replace("/");
    }
  };

  return (
    <div className="w-full h-screen min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:block overflow-hidden">
        <Image
          src="/images/tiling-logos.webp"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex items-center justify-center py-12 h-full">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-white">Login</h1>
            <p className="text-balance text-neutral-300">
              Enter your email below to login to your account
            </p>
          </div>

          <Form {...form}>
            <form
              onChange={() => {
                if (submitError) setSubmitError("");
              }}
              className="grid gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <div className="flex items-center">
                      <FormLabel className="text-white">Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && <FormMessage>{submitError}</FormMessage>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {!isLoading ? "Login" : <Loader />}
              </Button>
              {/* <Button variant="outline" className="w-full">
              Login with Google
            </Button> */}
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
