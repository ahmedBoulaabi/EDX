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
import { getAllStudents } from "@/lib/supabase/students/mutations";
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
import ModifyStudentModal from "./ModifyStudentModal";
import { students, users } from "@/lib/supabase/schema";
import { revalidatePath } from "next/cache";
import { getAllStudentTypes } from "@/lib/supabase/other/queries";

type student = {
  users: typeof users.$inferSelect;
  students: typeof students.$inferSelect;
};

const StudentList = async () => {
  const students = await getAllStudents();
  const studentTypes = await getAllStudentTypes();
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
    <div className="w-full max-h-[600px] overflow-y-scroll">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium">
                  {student.users.firstName} {student.users.lastName}
                </div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  {student.users.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">Master 1 IM</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{student.users.mobilePhone}</div>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <ModifyStudentModal
                  student={student}
                  studentTypes={studentTypes}
                />
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
                          handleDelete(student.users.id);
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

export default StudentList;
