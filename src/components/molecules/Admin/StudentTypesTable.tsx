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
import { getAllStudentTypes } from "@/lib/supabase/other/queries";
import { deleteStudentTypeById } from "@/lib/supabase/other/mutations";
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
import ModifyProgramModal from "./ModifyProgramModal";
import ModifyStudentTypeModal from "./ModifyStudentTypeModal";

// const student_types = [{ name: "FA" }, { name: "FI" }, { name: "FO" }];

const StudentTypesTable = async () => {
  const student_types = await getAllStudentTypes();
  revalidatePath("/");

  const handleDelete = async (type_id: string) => {
    "use server";
    try {
      const { error } = await deleteStudentTypeById(type_id);
      if (error) {
        console.error("Error deleting program:", error);
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  return (
    <div>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Map over teachers data to render each teacher */}
          {student_types.map((studentType, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium">{studentType.name}</div>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
                {/* Your action buttons */}
                {/* Example buttons: Modify and Delete */}
                <ModifyStudentTypeModal studentType={studentType} />

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
                          await handleDelete(studentType.id);
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

export default StudentTypesTable;
