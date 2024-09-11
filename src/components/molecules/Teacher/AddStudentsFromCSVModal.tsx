"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { StudentData, addStudents } from "@/lib/supabase/students/mutations";
import { Plus } from "lucide-react";
import Papa from "papaparse";

const AddStudentsFromCSVModal = () => {
  const handleFileSubmit = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (!event.target.files || event.target.files.length === 0) {
      toast({
        title: "Error",
        description: "No file selected.",
      });
      return;
    }

    const file = event.target.files[0];

    if (!file) {
      toast({
        title: "Error",
        description: "No file selected.",
      });
      return;
    }

    try {
      toast({
        title: "File Processing",
        description: "Your file is being processed.",
      });
      Papa.parse(event.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          console.log(results.data);
          const { error, data } = await addStudents(
            results.data as unknown as StudentData[]
          );

          if (error) {
            toast({
              title: "Some Errors Occured!",
              description: `Some students were not added: ${error.toString()}`,
            });
          } else {
            toast({
              title: "Everything went smoothly!",
              description: `${data?.length} Students added`,
            });
          }
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your file.",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          asChild
          size="sm"
          variant={"ghost"}
          className="ml-auto gap-1 hover:cursor-pointer mr-3"
        >
          <div>
            <Plus className="h-4 w-4" />
            Add Students From CSV
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add Students from CSV</DialogTitle>
          </DialogHeader>
          <div>Upload CSV File</div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSubmit}
            className="focus:ring-0 focus-visible:ring-0"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentsFromCSVModal;
