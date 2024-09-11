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
import { getAllRoomPlans } from "@/lib/supabase/other/queries";
import { revalidatePath } from "next/cache";

const RoomPlansTable = async () => {
  const roomPlans = await getAllRoomPlans();
  revalidatePath("/");
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
        {roomPlans &&
          roomPlans.map((roomPlan, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium">{roomPlan.name}</div>
              </TableCell>

              <TableCell className="flex justify-end gap-2">
                {/* Your action buttons */}
                {/* Example buttons: Modify and Delete */}
                <Button variant={"default"}>
                  <div className="gap-2 flex">
                    <Wrench className="w-5 h-5" />
                  </div>
                </Button>
                <Button variant={"destructive"}>
                  <div className="gap-2 flex">
                    <Trash className="w-5 h-5" />
                  </div>
                </Button>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default RoomPlansTable;
