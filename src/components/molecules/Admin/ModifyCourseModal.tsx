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
import React, { useEffect, useState } from "react";
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
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Plus,
  Wrench,
} from "lucide-react";
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
import {
  users,
  teachers as TeachersSchema,
  courses,
} from "@/lib/supabase/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { addCourse, updateCourseById } from "@/lib/supabase/other/mutations";
import { useRouter } from "next/navigation";

const courseTypes = [
  {
    name: "CM",
  },
  {
    name: "TD",
  },
  {
    name: "TP",
  },
  {
    name: "Examen_CCF",
  },
  {
    name: "Examen_CCI",
  },
  {
    name: "Session_2",
  },
];

const AddCourseFormSchema = z.object({
  name: z.string({
    required_error: "Course name is required.",
  }),
  instructor: z
    .string({
      required_error: "Teacher id is required.",
    })
    .uuid(),
  // courseType: z.string({
  //   required_error: "Course type is required.",
  // }),
});
type CourseType = typeof courseTypes extends (infer T)[] ? T : never;

interface ModifyCourseModalProps {
  course: {
    users: typeof users.$inferSelect;
    courses: typeof courses.$inferSelect;
  };
}
const ModifyCourseModal = ({ course }: ModifyCourseModalProps) => {
  const [open, setOpen] = React.useState(false);

  const [submitError, setSubmitError] = useState("");
  const [selectedCourseType, setSelectedCourseType] =
    React.useState<CourseType>();
  const [loading, setLoading] = useState<boolean>(false);

  const [teachers, setTeachers] = useState<
    Array<{
      users: typeof users.$inferSelect;
      teachers: typeof TeachersSchema.$inferSelect;
    }>
  >();

  useEffect(() => {
    async function getTeachers() {
      let result = await getAllTeachers();
      router.refresh();
      setTeachers(result);
    }
    if (!teachers) getTeachers();
  }, []);

  useEffect(() => {
    if (course) {
      async function fetchCourseDetails() {
        setLoading(true);
        try {
          form.setValue("name", course.courses.name ?? "");
          form.setValue("instructor", course.users.id);
        } catch (error) {
          console.error("Error fetching program details:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchCourseDetails();
    }
  }, [course]);

  const form = useForm<z.infer<typeof AddCourseFormSchema>>({
    resolver: zodResolver(AddCourseFormSchema),
  });
  const isLoading = form.formState.isSubmitting;
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof AddCourseFormSchema>) {
    try {
      const { error } = await updateCourseById(
        course.courses.id,
        data.name,
        data.instructor
      );

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
      console.error("Error updating course:", error);
      setSubmitError("Failed to update course details.");
    }
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

                {/* <FormField
                  control={form.control}
                  name=""
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Course Type</FormLabel>
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
                              {selectedCourseType
                                ? selectedCourseType.name
                                : "Load a course type..."}
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
                                {courseTypes.map(
                                  (courseType, index: number) => (
                                    <CommandItem
                                      key={index}
                                      onSelect={() => {
                                        setSelectedCourseType(courseType);
                                        setOpen(false);
                                      }}
                                    >
                                      {courseType.name}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          selectedCourseType?.name ===
                                            courseType.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  )
                                )}
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
                /> */}
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

export default ModifyCourseModal;
