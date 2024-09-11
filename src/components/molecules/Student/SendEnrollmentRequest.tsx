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
import { getAllPrograms } from "@/lib/supabase/other/queries";
import { users, programs as ProgramsSchema } from "@/lib/supabase/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { AddEnrollmentRequest } from "@/lib/supabase/other/mutations";

const EnrollmentRequestFormSchema = z.object({
  programs: z.string({
    required_error: "Program is required.",
  }),
});

const SendEnrollmentRequest = () => {
  const [open, setOpen] = React.useState(false);

  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

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

  const form = useForm<z.infer<typeof EnrollmentRequestFormSchema>>({
    resolver: zodResolver(EnrollmentRequestFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof EnrollmentRequestFormSchema>) {
    console.log(data.programs);

    const { error } = await AddEnrollmentRequest(data.programs);
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          asChild
          size="sm"
          className="ml-auto gap-1 hover:cursor-pointer"
        >
          <div>
            Send enrollment request
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-fit w-full pr-4">
              <DialogHeader>
                <DialogTitle>New Enrollment Request</DialogTitle>
                <DialogDescription>
                  Send a new enrollment request by selecting the desired
                  program.
                  <br />
                  Your application will be evaluated based on your profile
                  information. Please make sure your profile is up to date.
                  <br />
                  (Fields marked with * are required)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Programs FIELD*/}
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
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && programs
                                ? programs.find(
                                    (program) => program.id === field.value
                                  )?.name
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
                                {programs &&
                                  programs.map((program) => (
                                    <CommandItem
                                      value={program.name ?? ""}
                                      key={program.id}
                                      onSelect={() => {
                                        form.setValue("programs", program.id);
                                      }}
                                    >
                                      {program.name}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          program.id === field.value
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
                        This program will be added to your enrollment request.
                      </FormDescription>
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

export default SendEnrollmentRequest;
