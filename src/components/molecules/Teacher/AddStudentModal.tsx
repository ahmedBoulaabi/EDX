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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { generatePassword } from "@/lib/utils/generate-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import {
  addStudent,
  getStudentsTypes,
} from "@/lib/supabase/students/mutations";
import Loader from "@/components/atoms/Loader";

import { z } from "zod";
import { useRouter } from "next/navigation";

const AddStudentFormSchema = z
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
    password: z.string({
      required_error: "Password is required.",
    }),
    repeatPassword: z.string({
      required_error: "Please confirm your password.",
    }),
    studentNumber: z.string({
      required_error: "studentNumber is required.",
    }),
    studentType: z.string({
      required_error: "studentType is required.",
    }),
    studentStatus: z.string({
      required_error: "studentStatus is required.",
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

const AddStudentModal = () => {
  const [submitError, setSubmitError] = useState("");
  const [studentTypes, setStudentTypes] = useState<
    { id: string; name: string }[]
  >([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const types = await getStudentsTypes();
        router.refresh();
        setStudentTypes(types);
      } catch (error) {
        console.error("Error fetching student types:", error);
      }
    }
    fetchData();
  }, []);
  const form = useForm<z.infer<typeof AddStudentFormSchema>>({
    resolver: zodResolver(AddStudentFormSchema),
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof AddStudentFormSchema>) {
    const { error } = await addStudent(
      data.email,
      data.firstname,
      data.lastname,
      data.password,
      data.githubAccount,
      data.gitlabAccount,
      data.dob,
      data.studentNumber,
      data.studentType,
      data.studentStatus,
      data.mobilePhone,
      data.otherEmail
    );
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
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
          <div>
            Add Student
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[500px] w-full pr-4">
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
                <DialogDescription>
                  Add a new student to this establishment by filling this form!
                  <br />
                  (Fields marked with * are required)
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
                          placeholder="John"
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
                      <FormLabel>Email</FormLabel>
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
                      <FormLabel>Student Mobile Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                      <FormLabel>Date of birth</FormLabel>
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
                              date > new Date() || date < new Date("1900-01-01")
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

                <FormField
                  control={form.control}
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Student Number"
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
                  name="studentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Type</FormLabel>
                      <FormControl>
                        <select
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                          defaultValue="choose"
                        >
                          <option value="choose" disabled>
                            Choose...
                          </option>
                          {studentTypes.map((type, index) => (
                            <option key={index} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Status</FormLabel>
                      <FormControl>
                        <select
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                          defaultValue="choose"
                        >
                          <option value="choose" disabled>
                            Choose...
                          </option>
                          <option value="New">New</option>
                          <option value="Repeating">Repeating</option>
                        </select>
                      </FormControl>
                      <FormMessage />
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
                          placeholder="john.doe@gmail.com"
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
                <Button type="submit">
                  {!isLoading ? "Submit" : <Loader />}
                </Button>
              </DialogFooter>
            </ScrollArea>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
