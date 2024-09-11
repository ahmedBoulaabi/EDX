import { Trash, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import { getAllTeachers } from "@/lib/supabase/teachers/mutations";
import { deleteUserByIdFromBoth } from "@/lib/supabase/users/mutations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ModifyTeacherModal from "./ModifyTeacherModal";
import { teachers, users } from "@/lib/supabase/schema";
import { revalidatePath } from "next/cache";

type teacher = {
  users: typeof users.$inferSelect;
  teachers: typeof teachers.$inferSelect;
};

const TeacherList = async () => {
  const teachers = await getAllTeachers();
  revalidatePath("/");

  const handleDelete = async (user_id: string) => {
    "use server";
    try {
      const { error } = await deleteUserByIdFromBoth(user_id);
      if (!error) {
        window.location.reload();
      } else {
        console.error("Error deleting user:", error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Is Internal?</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Map over teachers data to render each teacher */}
          {teachers.map((teacher, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium">
                  {teacher.users.firstName} {teacher.users.lastName}
                </div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  {teacher.users.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {teacher.teachers.isInternal ? "Yes" : "No"}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{teacher.users.mobilePhone}</div>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <ModifyTeacherModal teacher={teacher} />
                <AlertDialog>
                  <AlertDialogTrigger>
                    <div className="p-2 px-4 flex gap-2 items-center justify-center rounded bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      <Trash className="h-4 w-4" />
                      Delete
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the data from the server.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form
                        action={async () => {
                          "use server";
                          handleDelete(teacher.users.id);
                          revalidatePath("/");
                        }}
                      >
                        <AlertDialogAction type="submit">
                          Confirm
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherList;
