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
import { CalendarIcon, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import Loader from "@/components/atoms/Loader";

import { z } from "zod";
import { generatePassword } from "@/lib/utils/generate-password";
import { Switch } from "@/components/ui/switch";
import { addSeance } from "@/lib/supabase/timeline/mutations";
import {
  getAllClassrooms,
  getAllCourses,
  getAllGroups,
} from "@/lib/supabase/other/queries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

const AddSeanceFormSchema = z
  .object({
    classroomId: z
      .string({
        required_error: "Classroomis required.",
      })
      .uuid(),
    courseId: z
      .string({
        required_error: "Course is required.",
      })
      .uuid(),
    date: z.date({
      required_error: "Date is required.",
    }),
    startTime: z.string({
      required_error: "Start time is required.",
    }),
    endTime: z.string({
      required_error: "End Time is required.",
    }),
    groups: z.array(z.string().uuid()),
  })
  .refine(
    (data) =>
      hoursAxis.indexOf(data.startTime) < hoursAxis.indexOf(data.endTime),
    {
      message: "End Time must be after start time!",
      path: ["endTime"],
    }
  );

const hoursAxis = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

interface AddSeanceModal {
  fetchSchedule: () => void;
}

const AddSeanceModal = ({ fetchSchedule }: AddSeanceModal) => {
  const [submitError, setSubmitError] = useState("");
  const [classrooms, setClassrooms] =
    useState<Awaited<ReturnType<typeof getAllClassrooms>>>();

  const [courses, setCourses] =
    useState<Awaited<ReturnType<typeof getAllCourses>>>();

  const [groupsList, setGroupsList] =
    useState<Awaited<ReturnType<typeof getAllGroups>>>();

  const form = useForm<z.infer<typeof AddSeanceFormSchema>>({
    resolver: zodResolver(AddSeanceFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  const router = useRouter();
  useEffect(() => {
    async function fetchClassrooms() {
      setClassrooms(await getAllClassrooms());
      setCourses(await getAllCourses());
      setGroupsList(await getAllGroups());
      router.refresh();
    }
    fetchClassrooms();
  }, []);

  async function onSubmit(data: z.infer<typeof AddSeanceFormSchema>) {
    const [startHours, startMinutes] = data.startTime.split(":").map(Number);
    const [endHours, endMinutes] = data.endTime.split(":").map(Number);
    const startDate = new Date(
      data.date.getFullYear(),
      data.date.getMonth(),
      data.date.getDate(),
      startHours,
      startMinutes
    );
    const endDate = new Date(
      data.date.getFullYear(),
      data.date.getMonth(),
      data.date.getDate(),
      endHours,
      endMinutes
    );

    const { error } = await addSeance(
      data.classroomId,
      data.courseId,
      startDate,
      endDate,
      data.date.getDate(),
      data.date.getMonth() + 1,
      data.date.getFullYear(),
      data.groups
    );

    router.refresh();
    fetchSchedule();

    if (error) {
      form.reset();
      setSubmitError(error);
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          asChild
          variant={"secondary"}
          className="border-white/20 border-[1px] hover:bg-white/40 duration-200"
        >
          <div className="flex justify-center items-center gap-2 hover:cursor-pointer">
            Add Seance
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[500px] w-full pr-4">
              <DialogHeader>
                <DialogTitle>Add Seance</DialogTitle>
                <DialogDescription>
                  Add a seance by filling this form!
                  <br />
                  (Fields marked with * are required)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* First Name FIELD*/}
                <FormField
                  control={form.control}
                  name="classroomId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full mt-4">
                      <FormLabel>Classroom*</FormLabel>
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
                              {field.value && classrooms
                                ? classrooms.find(
                                    (classroom) =>
                                      classroom.classrooms.id === field.value
                                  )?.classrooms.name
                                : "Select classroom"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Classroom..." />
                            <CommandEmpty>No Classroom found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList className="overflow-y-scroll">
                                {classrooms &&
                                  classrooms.map((classroom) => (
                                    <CommandItem
                                      value={
                                        classroom.buildings.name +
                                        "-" +
                                        classroom.classrooms.name
                                      }
                                      key={classroom.classrooms.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "classroomId",
                                          classroom.classrooms.id
                                        );
                                      }}
                                    >
                                      {classroom.buildings.name}
                                      {"-"}
                                      {classroom.classrooms.name}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          classroom.classrooms.id ===
                                            field.value
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

                {/* Date FIELD*/}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date*</FormLabel>
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
                      <FormDescription>The date is important.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course FIELD*/}
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full mt-4">
                      <FormLabel>Course*</FormLabel>
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
                              {field.value && courses
                                ? courses.find(
                                    (course) =>
                                      course.courses.id === field.value
                                  )?.courses.name
                                : "Select course"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search course..." />
                            <CommandEmpty>No course found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList className="w-[300px] overflow-y-scroll">
                                <ScrollArea>
                                  {courses &&
                                    courses.map((course) => (
                                      <CommandItem
                                        value={
                                          course.courses.name +
                                          " - " +
                                          course.courses.courseType
                                        }
                                        key={course.courses.id}
                                        onSelect={() => {
                                          form.setValue(
                                            "courseId",
                                            course.courses.id
                                          );
                                        }}
                                      >
                                        {course.courses.name +
                                          "-" +
                                          course.courses.courseType}
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            course.courses.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                </ScrollArea>
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

                {/* Start Time FIELD*/}
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full mt-4">
                      <FormLabel>Start Time*</FormLabel>
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
                              {field.value && hoursAxis
                                ? hoursAxis.find((time) => time === field.value)
                                : "Select course"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Time..." />
                            <CommandEmpty>No time found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList className="overflow-y-scroll">
                                <ScrollArea className="h-[400px] overflow-y-scroll">
                                  {hoursAxis &&
                                    hoursAxis.map((time) => (
                                      <CommandItem
                                        value={time}
                                        key={time}
                                        onSelect={() => {
                                          form.setValue("startTime", time);
                                        }}
                                        className="h-fit overflow-hidden"
                                      >
                                        {time}
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            time === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                </ScrollArea>
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

                {/* End Time FIELD*/}
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full mt-4">
                      <FormLabel>End Time*</FormLabel>
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
                              {field.value && hoursAxis
                                ? hoursAxis.find((time) => time === field.value)
                                : "Select course"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Time..." />
                            <CommandEmpty>No Time found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList className="overflow-y-scroll">
                                {hoursAxis &&
                                  hoursAxis.map((time) => (
                                    <CommandItem
                                      value={time}
                                      key={time}
                                      onSelect={() => {
                                        form.setValue("endTime", time);
                                      }}
                                    >
                                      {time}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          time === field.value
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

                {/* Groups */}
                <FormField
                  control={form.control}
                  name="groups"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Groups</FormLabel>
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
                              {field.value && groupsList
                                ? groupsList.find((group) =>
                                    field.value.includes(group.id)
                                  )?.name
                                : "Select course"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search group..." />
                            <CommandEmpty>No group found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {groupsList &&
                                  groupsList.map((group) => (
                                    <CommandItem
                                      value={group.name ?? ""}
                                      key={group.id}
                                      onSelect={() => {
                                        const currentGroups = field.value || [];
                                        if (!currentGroups.includes(group.id)) {
                                          form.setValue("groups", [
                                            ...currentGroups,
                                            group.id,
                                          ]);
                                        } else {
                                          form.setValue(
                                            "groups",
                                            field.value.filter(
                                              (a) => a != group.id
                                            )
                                          );
                                        }
                                      }}
                                    >
                                      {group.name}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value &&
                                            field.value.includes(group.id)
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
                      <div className="flex flex-wrap items-center border rounded p-2">
                        {field.value &&
                          field.value.map((group, index) => (
                            <span
                              key={index}
                              className="bg-gray-300 text-gray-700 rounded-full px-2 py-1 mr-2 mb-2 flex items-center"
                            >
                              {groupsList &&
                                groupsList?.find((a) => a.id == group)?.name}
                              <button
                                onClick={() =>
                                  form.setValue(
                                    "groups",
                                    field.value.filter((a) => a != group)
                                  )
                                }
                                className="ml-1 text-gray-500 hover:text-gray-700"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

export default AddSeanceModal;
