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
import { Plus, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import Loader from "@/components/atoms/Loader";

import { z } from "zod";
import { updateProgramById } from "@/lib/supabase/other/mutations";
import { programs } from "@/lib/supabase/schema";
import { useRouter } from "next/navigation";

const AddProgramFormSchema = z.object({
  name: z.string({
    required_error: "Program name is required.",
  }),
});

interface ModifyProgramModalPRops {
  program: typeof programs.$inferSelect;
}

const ModifyProgramModal = ({ program }: ModifyProgramModalPRops) => {
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (program) {
      async function fetchProgramDetails() {
        setLoading(true);
        try {
          form.setValue("name", program.name ?? "");
        } catch (error) {
          console.error("Error fetching program details:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchProgramDetails();
    }
  }, [program]);

  const form = useForm<z.infer<typeof AddProgramFormSchema>>({
    resolver: zodResolver(AddProgramFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  const router = useRouter();

  async function onSubmit(data: z.infer<typeof AddProgramFormSchema>) {
    try {
      const { error } = await updateProgramById(program.id, data.name);

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
      console.error("Error updating program:", error);
      setSubmitError("Failed to update program details.");
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
                <DialogTitle>Modify Program</DialogTitle>
                <DialogDescription>
                  Modify a program to this establishment by filling this form!
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
                          placeholder="IM M1"
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

export default ModifyProgramModal;
