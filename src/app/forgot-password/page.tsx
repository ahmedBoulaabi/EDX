"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
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
import {
  actionLoginUser,
  actionResetPassword,
} from "@/lib/server-action/auth-actions";
import clsx from "clsx";
import { MailCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ForgotPasswordFormSchema = z.object({
  email: z.string().describe("Email").email({ message: "Invalid Email" }),
});

export default function ForgotPassword() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const searchParams = useSearchParams();
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

  const form = useForm<z.infer<typeof ForgotPasswordFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<
    z.infer<typeof ForgotPasswordFormSchema>
  > = async (formData) => {
    const { error } = await actionResetPassword(formData.email);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }
    setConfirmation(true);
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
            <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
            <p className="text-balance text-neutral-300">
              Enter your email below to reset your password
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

                  {submitError && <FormMessage>{submitError}</FormMessage>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {!isLoading ? "Send email" : <Loader />}
                  </Button>
                </>
              )}
              {/* <Button variant="outline" className="w-full">
              Login with Google
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
        </div>
      </div>
    </div>
  );
}
