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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import Loader from "@/components/atoms/Loader";

import { z } from "zod";

const AddBuildingFormSchema = z.object({
  name: z.string({
    required_error: "Building name is required.",
  }),
});

const AddBuildingModal = () => {
  const [submitError, setSubmitError] = useState("");

  const form = useForm<z.infer<typeof AddBuildingFormSchema>>({
    resolver: zodResolver(AddBuildingFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof AddBuildingFormSchema>) {
    //   const { error } = await addTeacher(
    //     data.email,
    //     data.firstname,
    //     data.lastname,
    //     data.password,
    //     data.githubAccount,
    //     data.gitlabAccount,
    //     data.dob
    //   );
    //   if (error) {
    //     form.reset();
    //     setSubmitError(error.message);
    //   }

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
            Add Building
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-fit w-full pr-4">
              <DialogHeader>
                <DialogTitle>Add Building</DialogTitle>
                <DialogDescription>
                  Add a new building to this establishment by filling this form!
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
                          placeholder="A"
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
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

export default AddBuildingModal;
