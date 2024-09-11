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
import { getAllSchoolYears } from "@/lib/supabase/other/queries";
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
import { deleteSchoolYearById } from "@/lib/supabase/other/mutations";
import ModifySchoolYearModal from "./ModifySchoolYearModal";

const SchoolYearTable = async () => {
  const schoolyears = await getAllSchoolYears();
  revalidatePath("/");

  const handleDelete = async (school_year_id: string) => {
    "use server";
    try {
      const { error } = await deleteSchoolYearById(school_year_id);
      if (error) {
        console.error("Error deleting school year:", error);
      }
    } catch (error) {
      console.error("Error deleting school year:", error);
    }
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Map over teachers data to render each teacher */}
        {schoolyears.map((year, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="font-medium">{year.name}</div>
            </TableCell>

            <TableCell className="flex justify-end gap-2">
              {/* Your action buttons */}
              {/* Example buttons: Modify and Delete */}
              <ModifySchoolYearModal schoolYear={year} />
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
                        await handleDelete(year.id);
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
};

export default SchoolYearTable;
