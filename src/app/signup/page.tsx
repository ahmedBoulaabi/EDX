"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { actionSignUpUser } from "@/lib/server-action/auth-actions";
import clsx from "clsx";
import { MailCheck } from "lucide-react";

const SignUpFormSchema = z
  .object({
    firstName: z.string().nonempty({ message: "First name is required" }),
    lastName: z.string().nonempty({ message: "Last name is required" }),
    email: z.string().describe("Email").email({ message: "Invalid Email" }),
    password: z
      .string()
      .describe("Password")
      .min(6, "Password must be minimum 6 characters"),
    confirmPassword: z
      .string()
      .describe("Confirm Password")
      .min(6, "Password must be minimum 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const codeExchangeError = useMemo(() => {
    if (!searchParams) return "";
    return searchParams.get("error_description");
  }, [searchParams]);

  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx("bg-primary", {
        "bg-red-500/10": codeExchangeError,
        "border-red-500/50": codeExchangeError,
        "text-red-700": codeExchangeError,
      }),
    [codeExchangeError]
  );

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }: z.infer<typeof SignUpFormSchema>) => {
    const { error } = await actionSignUpUser(
      email,
      password,
      firstName,
      lastName
    );
    if (error) {
      setSubmitError(error.message);
      form.reset();
      return;
    }
    setConfirmation(true);
  };

  return (
    <div className="w-full h-screen min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:block max-h-full overflow-hidden">
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
            <h1 className="text-3xl font-bold text-white">Sign Up</h1>
            <p className="text-balance text-neutral-300">
              Fill the form fields to create an account!
            </p>
            {/* Handle Error
            {searchParams?.error && (
              <Alert className="bg-red-400 py-3">
                <AlertDescription>
                  <span className="font-bold">Error:</span>{" "}
                  {searchParams?.error}
                </AlertDescription>
              </Alert>
            )} */}
          </div>
          <Form {...form}>
            <form
              onChange={() => {
                if (submitError) setSubmitError("");
              }}
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              {!confirmation && !codeExchangeError && (
                <>
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
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
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
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel className="text-white">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {!isLoading ? "Register" : <Loader />}
                  </Button>
                </>
              )}
              {submitError && <FormMessage>{submitError}</FormMessage>}
              {/* <Button variant="outline" className="w-full">
              Register with Google
            </Button> */}

              {(confirmation || codeExchangeError) && (
                <>
                  <Alert
                    className={clsx(
                      confirmationAndErrorStyles,
                      codeExchangeError ? "bg-neutral-900" : "bg-green-900"
                    )}
                  >
                    {!codeExchangeError && <MailCheck className="h-4 w-4" />}
                    <AlertTitle>
                      {codeExchangeError ? "Invalid Link" : "Check your email."}
                    </AlertTitle>
                    <AlertDescription>
                      {codeExchangeError ||
                        "An email confirmation has been sent."}
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
