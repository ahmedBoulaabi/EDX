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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildings as buildingsSchema,
  roomPlans as roomPlansSchema,
} from "@/lib/supabase/schema";
import { getAllBuildings, getAllRoomPlans } from "@/lib/supabase/other/queries";
import { useRouter } from "next/navigation";

const CLASSROOM_TYPES = ["PC", "cours"];

const AddClassroomFormSchema = z.object({
  name: z.string({
    required_error: "Name is required.",
  }),
  type: z.string({
    required_error: "Type is required.",
  }),
  building: z
    .string({
      required_error: "Building is required.",
    })
    .uuid(),
  plan: z
    .string({
      required_error: "Room plan is required.",
    })
    .uuid(),
});

const AddClassroomModal = () => {
  const [submitError, setSubmitError] = useState("");
  const [buildings, setBuildings] =
    useState<Array<typeof buildingsSchema.$inferSelect>>();
  const [roomPlans, setRoomPlans] =
    useState<Array<typeof roomPlansSchema.$inferSelect>>();

  const router = useRouter();

  useEffect(() => {
    async function getBuildings() {
      let result = await getAllBuildings();
      router.refresh();
      setBuildings(result);
    }
    async function getRoomPlans() {
      let result = await getAllRoomPlans();
      router.refresh();
      setRoomPlans(result);
    }
    if (!buildings) getBuildings();
    if (!roomPlans) getRoomPlans();
  }, []);

  const form = useForm<z.infer<typeof AddClassroomFormSchema>>({
    resolver: zodResolver(AddClassroomFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof AddClassroomFormSchema>) {
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
            Add Classroom
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-fit w-full pr-4">
              <DialogHeader>
                <DialogTitle>Add Classroom</DialogTitle>
                <DialogDescription>
                  Add a new Classroom to this establishment by filling this
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
                          placeholder="001"
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type FIELD*/}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASSROOM_TYPES &&
                            CLASSROOM_TYPES.map((type, index) => (
                              <SelectItem key={index} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Building FIELD*/}
                <FormField
                  control={form.control}
                  name="building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a building" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {buildings &&
                            buildings.map((building) => (
                              <SelectItem key={building.id} value={building.id}>
                                {building.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Room Pla  FIELD*/}
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Plan*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomPlans &&
                            roomPlans.map((roomplan) => (
                              <SelectItem key={roomplan.id} value={roomplan.id}>
                                {roomplan.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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

export default AddClassroomModal;
