import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCourses } from "@/lib/supabase/other/queries";
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
import { revalidatePath } from "next/cache";
import { deleteCourseById } from "@/lib/supabase/other/mutations";
import ModifyCourseModal from "./ModifyCourseModal";

export default async function CourseTable() {
  const courses = await getAllCourses();
  revalidatePath("/");

  const handleDelete = async (course_id: string) => {
    "use server";
    try {
      const { error } = await deleteCourseById(course_id);
      if (error) {
        console.error("Error deleting program:", error);
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Map over teachers data to render each teacher */}
        {courses.map((course, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="font-medium">{course.courses.name}</div>
            </TableCell>

            <TableCell>
              <div className="font-medium">{`${course.users.firstName} ${course.users.lastName}`}</div>
            </TableCell>

            <TableCell className="flex justify-end gap-2">
              {/* Your action buttons */}
              {/* Example buttons: Modify and Delete */}
              <ModifyCourseModal course={course} />
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
                      This action cannot be undone. This will permanently delete
                      the data from the server.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form
                      action={async () => {
                        "use server";
                        await handleDelete(course.courses.id);
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
  );
}
