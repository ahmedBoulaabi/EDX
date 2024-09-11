import { ArrowUpRight, BookUser, Check, X } from "lucide-react";
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
import {
  deleteEnrollmentById,
  updateStudentRequestStatusById,
} from "@/lib/supabase/other/mutations";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import EnrollmentRow from "./EnrollmentRow"; // Import the new client component

const EnrollmentList = async () => {
  const { data: enrollmentRequests, error } = await getEnrollmentRequests();
  revalidatePath("/");
  if (error) {
    return <div>Error loading enrollment requests: {error.message}</div>;
  }

  return (
    <div>
      <Table className="w-full max-h-[600px] overflow-y-scroll">
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollmentRequests.map((request) => (
            <EnrollmentRow
              key={request.enrollmentRequestId}
              request={request}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EnrollmentList;
