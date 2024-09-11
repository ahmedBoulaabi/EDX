"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash, Wrench } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { Dispatch, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  addTeacher,
  updateTeacherById,
} from "@/lib/supabase/teachers/mutations";
import Loader from "@/components/atoms/Loader";

import { z } from "zod";
import { generatePassword } from "@/lib/utils/generate-password";
import { getTeacherById } from "@/lib/supabase/teachers/mutations";
import { students, teachers, users } from "@/lib/supabase/schema";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

const AddTeacherFormSchema = z
  .object({
    firstname: z.string({
      required_error: "First name is required.",
    }),
    lastname: z.string({
      required_error: "Last name is required.",
    }),
    email: z
      .string({
        required_error: "Email is required.",
      })
      .email("Invalid email address."),
    dob: z.date({
      required_error: "A date of birth is required.",
    }),
    githubAccount: z.string().optional(), // Optional GitHub account
    gitlabAccount: z.string().optional(), // Optional GitLab account
    password: z.string().optional(),
    repeatPassword: z.string().optional(),
    isInternal: z.boolean({
      required_error: "isInternal is required.",
    }),
    mobilePhone: z.string({
      required_error: "Mobile phone is required.",
    }),
    otherEmail: z.string().optional(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Password don't match",
    path: ["repeatPassword"],
  });

interface ModifyTeacherModalProps {
  teacher: {
    users: typeof users.$inferSelect;
    teachers: typeof teachers.$inferSelect;
  };
}

const ModifyTeacherModal = ({ teacher }: ModifyTeacherModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (teacher) {
      async function fetchTeacherDetails() {
        setLoading(true);
        try {
          form.setValue("firstname", teacher.users.firstName ?? "");
          form.setValue("lastname", teacher.users.lastName ?? "");
          form.setValue("githubAccount", teacher.users.githubUser ?? "");
          form.setValue("gitlabAccount", teacher.users.gitlabUser ?? "");
          form.setValue("email", teacher.users.email ?? "");
          form.setValue(
            "dob",
            new Date(teacher.users.birthDate ?? "01-01-2000")
          );
          form.setValue("isInternal", teacher.teachers.isInternal ?? true);
          form.setValue("otherEmail", teacher.users.otherEmail ?? "");
          form.setValue("mobilePhone", teacher.users.mobilePhone ?? "");
        } catch (error) {
          console.error("Error fetching teacher details:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchTeacherDetails();
    }
  }, [teacher]);

  const [submitError, setSubmitError] = useState("");

  const form = useForm<z.infer<typeof AddTeacherFormSchema>>({
    resolver: zodResolver(AddTeacherFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  const router = useRouter();

  async function onSubmit(data: z.infer<typeof AddTeacherFormSchema>) {
    try {
      const { error } = await updateTeacherById(teacher.users.id, {
        email: data.email,
        firstName: data.firstname,
        lastName: data.lastname,
        dob: data.dob,
        githubAccount: data.githubAccount,
        gitlabAccount: data.gitlabAccount,
        isInternal: data.isInternal,
        mobilePhone: data.mobilePhone,
        otherEmail: data.otherEmail,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "You submitted the following values:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating teacher:", error);
      setSubmitError("Failed to update teacher details.");
    }
  }

  function handleGeneratePassword() {
    const password = generatePassword(16);
    form.setValue("password", password);
    form.setValue("repeatPassword", password);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          asChild
          size="sm"
          className="ml-auto gap-1 hover:cursor-pointer"
        >
          <div className="gap-2 flex">
            <Wrench className="w-5 h-5" />
            Modify
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        {loading ? (
          <Loader />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ScrollArea className="h-[500px] w-full pr-4">
                <DialogHeader>
                  <DialogTitle>Modify Teacher</DialogTitle>
                  <DialogDescription>
                    {/* Add a new teacher to this establishment by filling this form!
                  <br />
                  (Fields marked with * are required) */}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* First Name FIELD*/}
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name FIELD*/}
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email FIELD*/}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Other Email FIELD*/}
                  <FormField
                    control={form.control}
                    name="otherEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@gmail.com"
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobilePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher Mobile Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0615781572"
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Date of Birth DoB FIELD*/}
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of birth*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown-buttons"
                              fromYear={1950}
                              toYear={2030}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Your date of birth is used to calculate your age.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* is internal FIELD*/}
                  <FormField
                    control={form.control}
                    name="isInternal"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            is_internal
                          </FormLabel>
                          <FormDescription>
                            Is this teacher internal ?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Github Account FIELD*/}
                  <FormField
                    control={form.control}
                    name="githubAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Github</FormLabel>
                        <FormControl>
                          <Input
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gitlab Account FIELD*/}
                  <FormField
                    control={form.control}
                    name="gitlabAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gitlab</FormLabel>
                        <FormControl>
                          <Input
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password*</FormLabel>
                        <FormControl>
                          <Input
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="repeatPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat Password*</FormLabel>
                        <FormControl>
                          <Input
                            className="focus:ring-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex w-full justify-start">
                          <Button
                            type="button"
                            variant={"outline"}
                            onClick={() => handleGeneratePassword()}
                          >
                            Generate Password
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="mt-4">
                  {submitError && <FormMessage>{submitError}</FormMessage>}
                  <Button type="submit">
                    {!isLoading ? "Save changes" : <Loader />}
                  </Button>
                </DialogFooter>
              </ScrollArea>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModifyTeacherModal;
