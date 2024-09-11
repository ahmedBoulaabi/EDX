import { Check, X } from "lucide-react";
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
import { getEnrollmentRequests } from "@/lib/supabase/other/queries";
import { revalidatePath } from "next/cache";
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
import { Trash, Wrench } from "lucide-react";
import { deleteEnrollmentById } from "@/lib/supabase/other/mutations";

const EnrollmentList = async () => {
  const { data: enrollmentRequests, error } = await getEnrollmentRequests();
  revalidatePath("/");

  if (error) {
    return <div>Error loading enrollment requests: {error.message}</div>;
  }

  const handleDelete = async (enrollment_id: string) => {
    "use server";
    try {
      const { error } = await deleteEnrollmentById(enrollment_id);
      if (!error) {
        window.location.reload();
      } else {
        console.error("Error deleting user:", error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const getStateStyles = (state: string) => {
    switch (state) {
      case "accepted":
        return " text-green-800";
      case "rejected":
        return " text-red-800";
      case "pending":
      default:
        return " text-orange-400";
    }
  };

  return (
    <div>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Program</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollmentRequests.map((request) => (
            <TableRow key={request.enrollmentRequestId}>
              <TableCell>
                <div className="font-medium">{request.program.name}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {new Date(request.requestDate).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className={`${getStateStyles(request.state)}`}>
                  {request.state.charAt(0).toUpperCase() +
                    request.state.slice(1)}
                </div>{" "}
              </TableCell>
              <TableCell>
                <div className="font-medium">{request.note}</div>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {/* Action buttons */}
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
                          await handleDelete(request.enrollmentRequestId);
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

export default EnrollmentList;
