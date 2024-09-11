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
import React, { FormEvent, useEffect, useState } from "react";
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
import { CalendarIcon, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import Loader from "@/components/atoms/Loader";

import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllTeachers } from "@/lib/supabase/teachers/mutations";
import { getAllPrograms } from "@/lib/supabase/other/queries";
import {
  users,
  teachers as TeachersSchema,
  programs as ProgramsSchema,
  CourseType,
} from "@/lib/supabase/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { addCourse } from "@/lib/supabase/other/mutations";
import { useRouter } from "next/navigation";

const courseTypes = CourseType.enumValues;

const AddCourseFormSchema = z.object({
  name: z.string({
    required_error: "Course name is required.",
  }),
  instructor: z
    .string({
      required_error: "Teacher id is required.",
    })
    .uuid(),
  courseType: z.enum(courseTypes),
  programs: z.string({
    required_error: "Program is required.",
  }),
});

const AddCourseModal = () => {
  const [open, setOpen] = React.useState(false);

  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  const [teachers, setTeachers] = useState<
    Array<{
      users: typeof users.$inferSelect;
      teachers: typeof TeachersSchema.$inferSelect;
    }>
  >();

  const [programs, setPrograms] = useState<
    Array<{
      name: string | null;
      id: string;
    }>
  >();

  useEffect(() => {
    async function getPrograms() {
      let result = await getAllPrograms();
      router.refresh();
      setPrograms(result);
    }
    if (!programs) getPrograms();
  }, []);

  useEffect(() => {
    async function getTeachers() {
      let result = await getAllTeachers();
      router.refresh();
      setTeachers(result);
    }
    if (!teachers) getTeachers();
  }, []);

  const form = useForm<z.infer<typeof AddCourseFormSchema>>({
    resolver: zodResolver(AddCourseFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof AddCourseFormSchema>) {
    const { error } = await addCourse(
      data.name,
      data.instructor,
      data.courseType,
      tags
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

  const [tags, setTags] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);
  const [inputValue, setInputValue] = useState("");

  const addTag = (program: { id: string; name: string }) => {
    if (!tags.some((tag) => tag.id === program.id)) {
      setTags([...tags, program]);
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          asChild
          size="sm"
          className="ml-auto gap-1 hover:cursor-pointer"
        >
          <div>
            Add Course
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-fit w-full pr-4">
              <DialogHeader>
                <DialogTitle>Add Course</DialogTitle>
                <DialogDescription>
                  Add a new course to this establishment by filling this form!
                  <br />
                  (Fields marked with * are required)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Name FIELD*/}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Development Web"
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instructor FIELD*/}
                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Instructor</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && teachers
                                ? teachers.find(
                                    (teacher) =>
                                      teacher.users.id === field.value
                                  )?.users.email
                                : "Select Teacher"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Instructor..." />
                            <CommandEmpty>No instructor found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {teachers &&
                                  teachers.map((teacher) => (
                                    <CommandItem
                                      value={
                                        teacher.users.firstName +
                                          " " +
                                          teacher.users.lastName ?? ""
                                      }
                                      key={teacher.users.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "instructor",
                                          teacher.users.id
                                        );
                                      }}
                                    >
                                      {teacher.users.firstName}{" "}
                                      {teacher.users.lastName}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          teacher.users.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        This is the Instructor that will be assigned this
                        course.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instructor FIELD*/}
                <FormField
                  control={form.control}
                  name="courseType"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Course Type*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && courseTypes
                                ? courseTypes.find(
                                    (type) => type === field.value
                                  )
                                : "Select type"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Type..." />
                            <CommandEmpty>No Course types found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {courseTypes &&
                                  courseTypes.map((type) => (
                                    <CommandItem
                                      value={type + " " + type ?? ""}
                                      key={type}
                                      onSelect={() => {
                                        form.setValue("courseType", type);
                                      }}
                                    >
                                      {type}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          type === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {/* <FormDescription>
                        This is the Instructor that will be assigned this
                        course.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="programs"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Program</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-label="Load a preset..."
                              aria-expanded={open}
                              className="flex-1 justify-between md:max-w-[200px] lg:max-w-[300px] bg-brand-gray-light"
                            >
                              {"Select a program..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Program..." />
                            <CommandEmpty>No program found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {programs &&
                                  programs.map((program) => (
                                    <CommandItem
                                      value={program.name ?? ""}
                                      key={program.id}
                                      onSelect={() => {
                                        form.setValue("programs", program.id);
                                        if (
                                          program.name &&
                                          !tags.some(
                                            (tag) => tag.id === program.id
                                          )
                                        ) {
                                          setTags((prevTags) => [
                                            ...prevTags,
                                            {
                                              id: program.id,
                                              name: program.name as string,
                                            },
                                          ]);
                                        }
                                      }}
                                    >
                                      {program.name}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          tags.findIndex(
                                            (a) => a.id == program.id
                                          ) >= 0
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        This program will be added to this course.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-wrap items-center border rounded p-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-300 text-gray-700 rounded-full px-2 py-1 mr-2 mb-2 flex items-center"
                    >
                      {tag.name}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <DialogFooter className="mt-4">
                {submitError && <FormMessage>{submitError}</FormMessage>}
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

export default AddCourseModal;
