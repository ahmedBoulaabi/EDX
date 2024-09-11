"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import Loader from "@/components/atoms/Loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import {
  addSchoolYear,
  updateSchoolYearById,
} from "@/lib/supabase/other/mutations";
import { schoolyears } from "@/lib/supabase/schema";
import { useRouter } from "next/navigation";

const AddSchoolYearFormSchema = z.object({
  name: z.string({
    required_error: "School Year name is required.",
  }),
  start: z.date({
    required_error: "Start Year name is required.",
  }),
  end: z.date({
    required_error: "End Year name is required.",
  }),
  is_visible: z.boolean({
    required_error: "Is Visible is required.",
  }),
});

interface ModifySchoolYeanModalProps {
  schoolYear: typeof schoolyears.$inferSelect;
}

const ModifySchoolYearModal = ({ schoolYear }: ModifySchoolYeanModalProps) => {
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (schoolYear) {
      async function fetchStudentTypeDetails() {
        setLoading(true);
        try {
          form.setValue("name", schoolYear.name ?? "");
          form.setValue("start", new Date(schoolYear.begin ?? "01-01-2000"));
          form.setValue("end", new Date(schoolYear.end ?? "01-01-2000"));
          form.setValue("is_visible", schoolYear.isVisible ?? true);
        } catch (error) {
          console.error("Error fetching school year details:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchStudentTypeDetails();
    }
  }, [schoolYear]);

  const form = useForm<z.infer<typeof AddSchoolYearFormSchema>>({
    resolver: zodResolver(AddSchoolYearFormSchema),
  });

  const isLoading = form.formState.isSubmitting;
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof AddSchoolYearFormSchema>) {
    try {
      const { error } = await updateSchoolYearById(
        schoolYear.id,
        data.name,
        data.start,
        data.end,
        data.is_visible
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
      console.error("Error updating school year:", error);
      setSubmitError("Failed to update school year details.");
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
                <DialogTitle>Modify</DialogTitle>
                <DialogDescription>
                  Add a new School Year to this establishment by filling this
                  form!
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
                          placeholder="2023-2024"
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Start FIELD*/}
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start*</FormLabel>
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
                            fromYear={2000}
                            toYear={2050}
                            // disabled={(date) =>
                            //   date > new Date() || date < new Date("1900-01-01")
                            // }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* End FIELD*/}
                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End*</FormLabel>
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
                            fromYear={2000}
                            toYear={2050}
                            // disabled={(date) =>
                            //   date > new Date() || date < new Date("1900-01-01")
                            // }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* is visible FIELD*/}
                <FormField
                  control={form.control}
                  name="is_visible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">is_visible</FormLabel>
                        <FormDescription>
                          Whether or not this year will be visible across the
                          platform
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

export default ModifySchoolYearModal;
