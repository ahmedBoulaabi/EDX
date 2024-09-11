import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Minus, Plus, UserCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { students } from "@/lib/supabase/schema";
import Image from "next/image";
import clsx from "clsx";
import {
  Seating,
  StudentWithUser,
} from "@/app/(room-planner)/seance/[id]/page";
import { UniqueIdentifier } from "@dnd-kit/core";
import { availableStudentsATOM, seatingATOM } from "./state/planner-state";
import { useAtom } from "jotai";

interface StudentDrawer {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  students: StudentWithUser[];
  selectedSeat: UniqueIdentifier | undefined;
}

export default function StudentDrawer({
  isOpen,
  setIsOpen,
  students,
  selectedSeat,
}: StudentDrawer) {
  const [selected, setSelected] = useState<StudentWithUser>();
  const [seating, setSeating] = useAtom(seatingATOM);
  const [availableStudents, setAvailableStudents] = useAtom(
    availableStudentsATOM
  );

  useEffect(() => {
    const assignedStudentIds = new Set(
      Object.values(seating).map((seat) => seat.student.id)
    );
    const filteredStudents = students.filter(
      (student) => !assignedStudentIds.has(student.id)
    );
    setAvailableStudents(filteredStudents);
  }, [students, seating]);

  const handleUpdateSeating = () => {
    if (selected && selectedSeat) {
      setIsOpen(false);
      // removing the selected student from the list
      setAvailableStudents(
        (prev) => prev && prev.filter((s) => s !== selected)
      );
      // if there was a student in this seat already we add him back to the list
      if (seating[selectedSeat] !== undefined) {
        setAvailableStudents(
          (prev) => prev && [...prev, seating[selectedSeat].student]
        );
      }
      setSeating((prev) => ({
        ...prev,
        [selectedSeat]: {
          seat_id: selectedSeat,
          student: selected,
        },
      }));
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
      <DrawerContent className="w-full">
        <div className="w-full px-4">
          <DrawerHeader className="flex flex-col items-center">
            <DrawerTitle>Select Student</DrawerTitle>
            <DrawerDescription>Assign student to the seat</DrawerDescription>
          </DrawerHeader>
          <div className="flex gap-3 w-full overflow-x-scroll invisible-scroll">
            {availableStudents &&
              availableStudents.map((student) => (
                <div
                  key={student.id}
                  className={clsx(
                    "group select-none active:bg-yellow-900/20 relative aspect-square w-full max-w-[120px] bg-brand-gray-light min-w-[160px] rounded flex items-center justify-center hover:opacity-80 duration-200 hover:cursor-grab",
                    selected &&
                      selected.id === student.id &&
                      "border-brand-yellow border-2 bg-yellow-900/20"
                  )}
                  onClick={() => setSelected(student)}
                >
                  {student.photo ? (
                    <Image
                      src={student.photo}
                      alt="seat icon"
                      className="opacity-50 group-hover:opacity-100 object-cover duration-200 select-none pointer-events-none rounded-full aspect-square"
                      width={90}
                      height={90}
                    />
                  ) : (
                    <UserCircleIcon
                      className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
                      width={45}
                      height={45}
                    />
                  )}
                  <div className="absolute bottom-2 text-xs">
                    {student.user.lastName} {student.user.firstName}
                  </div>
                </div>
              ))}
          </div>
          <DrawerFooter className="flex flex-col items-center w-full">
            <Button
              className="w-full max-w-sm"
              onClick={() => handleUpdateSeating()}
            >
              Submit
            </Button>
            <DrawerClose asChild>
              <Button className="w-full max-w-sm" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
