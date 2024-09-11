"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, BookUser, Check, X, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  deleteEnrollmentById,
  updateStudentRequestStatusById,
} from "@/lib/supabase/other/mutations";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface EnrollmentRowProps {
  request: any;
}

const EnrollmentRow: React.FC<EnrollmentRowProps> = ({ request }) => {
  const router = useRouter();

  const handleDelete = async (enrollment_id: string) => {
    try {
      const { error } = await deleteEnrollmentById(enrollment_id);
      if (!error) {
        router.refresh();
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

  const onSubmit = async (
    enrollment_id: string,
    state: string,
    student_id: string,
    program_id: string
  ) => {
    try {
      const response = await updateStudentRequestStatusById(
        enrollment_id,
        state,
        "N/A",
        student_id,
        program_id
      );
      if (response.error) {
        throw new Error(response.error.message);
      }
      toast({
        title: "Request updated successfully!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              Response : {JSON.stringify(state, null, 2)}
            </code>
          </pre>
        ),
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update request status.",
      });
    }
  };

  return (
    <TableRow key={request.enrollmentRequestId}>
      <TableCell>
        <div className="font-medium">{request.student.name}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {request.student.email}
        </div>
      </TableCell>
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
          {request.state.charAt(0).toUpperCase() + request.state.slice(1)}
        </div>{" "}
      </TableCell>
      <TableCell>
        <div className="font-medium">{request.note}</div>
      </TableCell>
      <TableCell className="flex justify-end gap-2">
        {/* Action buttons */}
        {request.state === "pending" ? (
          <>
            <Button
              onClick={() =>
                onSubmit(
                  request.enrollmentRequestId,
                  "rejected",
                  request.student.id,
                  request.program.id
                )
              }
              size="sm"
              className="w-fit gap-1"
              variant={"destructive"}
            >
              <X className="w-5 h-5" />
              Reject
            </Button>
            <Button
              onClick={() =>
                onSubmit(
                  request.enrollmentRequestId,
                  "accepted",
                  request.student.id,
                  request.program.id
                )
              }
              size="sm"
              className="bg-green-400 w-fit gap-1"
            >
              <Check className="w-5 h-5" />
              Accept
            </Button>
          </>
        ) : request.state === "accepted" ? (
          <Button
            onClick={() =>
              onSubmit(
                request.enrollmentRequestId,
                "rejected",
                request.student.id,
                request.program.id
              )
            }
            size="sm"
            className="w-fit gap-1"
            variant={"destructive"}
          >
            <X className="w-5 h-5" />
            Reject
          </Button>
        ) : request.state === "rejected" ? (
          <Button
            onClick={() =>
              onSubmit(
                request.enrollmentRequestId,
                "accepted",
                request.student.id,
                request.program.id
              )
            }
            size="sm"
            className="bg-green-400 w-fit gap-1"
          >
            <Check className="w-5 h-5" />
            Accept
          </Button>
        ) : null}
        <Button size="sm" className="w-fit gap-1">
          <Link
            href={`/teacher/student-request-details/${request.enrollmentRequestId}`}
            className="flex gap-1"
          >
            Details
            <BookUser className="h-4 w-4" />
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <div className="p-2 px-4 flex gap-2 items-center justify-center rounded bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash className="h-4 w-4" />
              Delete
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                data from the server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(request.enrollmentRequestId)}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};

export default EnrollmentRow;
