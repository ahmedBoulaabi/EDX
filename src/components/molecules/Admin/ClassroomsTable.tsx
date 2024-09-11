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
import { getAllClassrooms } from "@/lib/supabase/other/queries";
import { revalidatePath } from "next/cache";

const ClassroomsTable = async () => {
  const classrooms = await getAllClassrooms();
  revalidatePath("/");
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Building</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Plan</TableHead>

          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Map over teachers data to render each teacher */}
        {classrooms &&
          classrooms.map((classroom, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium">{classroom.classrooms.name}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{classroom.classrooms.type}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{classroom.buildings.name}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {classroom.classrooms.maxCapacity}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{classroom.room_plans.name}</div>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
                {/* Your action buttons */}
                {/* Example buttons: Modify and Delete */}
                <Button variant={"default"}>
                  <div className="gap-2 flex">
                    <Wrench className="w-5 h-5" />
                    Modify
                  </div>
                </Button>
                <Button variant={"destructive"}>
                  <div className="gap-2 flex">
                    <Trash className="w-5 h-5" />
                    Delete
                  </div>
                </Button>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default ClassroomsTable;
