"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  ClientRect,
  DndContext,
  DragOverlay,
  Over,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { Coordinates, DragEndEvent, Translate } from "@dnd-kit/core/dist/types";
import { Canvas } from "@/components/molecules/Planner/Canvas";
import { Addable } from "@/components/molecules/Planner/Addable";
import { generateNonBreaking } from "@/lib/utils/generate-password";
import RowUtility from "@/components/molecules/Planner/utilities/RowUtility";
import SeatBlock from "@/components/molecules/Planner/building-blocks/SeatBlock";
import RowBlock from "@/components/molecules/Planner/building-blocks/RowBlock";
import { atom, useAtom } from "jotai";
import { Switch } from "@/components/ui/switch";
import {
  PresenceATOM,
  isBlockNameVisibleATOM,
  numberOfRowsATOM,
  numberOfSeatsATOM,
  rowsDataATOM,
  seatingATOM,
} from "@/components/molecules/Planner/state/planner-state";
import RowWithSeats from "@/components/molecules/Planner/building-blocks/RowWithSeats";
import { ZoomTransform, zoomIdentity } from "d3-zoom";
import SeatUtility from "@/components/molecules/Planner/utilities/SeatUtility";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  createPlan,
  saveStudentSeating,
} from "@/lib/supabase/planner/mutations";
import { toast } from "@/components/ui/use-toast";
import { Card, Row, RowsDataType } from "../../planner/page";
import {
  ArrowLeftToLine,
  File,
  Save,
  SendToBackIcon,
  UserCircle,
  UserRoundCheck,
} from "lucide-react";
import {
  getSeanceData,
  getStudentPresence,
  getStudentSeating,
} from "@/lib/supabase/planner/queries";
import StudentBlock from "@/components/molecules/Planner/building-blocks/StudentBlock";
import Link from "next/link";
import StudentDrawer from "@/components/molecules/Planner/StudentDrawer";
import {
  studentSeatings,
  students as studentsSchema,
  users,
} from "@/lib/supabase/schema";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import PresenceModal, {
  Presence,
} from "@/components/molecules/Planner/PresenceModal";
import GenerateRepositoriesModal from "@/components/molecules/Teacher/GenerateRepositoriesModal";

const createSeatCards = (number: number) => {
  let cards = [];
  for (let i = 0; i < number; i++) {
    cards.push({
      id: "Seat-" + generateNonBreaking(5),
      coordinates: { x: 0, y: 0 },
      text: "Seat Block",
      type: "seat",
      block: <SeatUtility />,
      utility: <SeatUtility />,
    });
  }
  return cards;
};

const calculateCanvasPosition = (
  initialRect: ClientRect,
  over: Over,
  delta: Translate,
  transform: ZoomTransform
): Coordinates => ({
  x:
    (initialRect.left + delta.x - (over?.rect?.left ?? 0) - transform.x) /
    transform.k,
  y:
    (initialRect.top + delta.y - (over?.rect?.top ?? 0) - transform.y) /
    transform.k,
});

export type StudentWithUser = typeof studentsSchema.$inferSelect & {
  user: typeof users.$inferSelect;
};

export type Seating = {
  [key: string]: { seat_id: UniqueIdentifier; student: StudentWithUser };
};

export default function Seance({ params }: { params: { id: string } }) {
  const [isBlockNameVisible, setIsBlockNameVisible] = useAtom(
    isBlockNameVisibleATOM
  );

  const [seanceData, setSeanceData] =
    useState<Awaited<ReturnType<typeof getSeanceData>>>();

  const [cards, setCards] = useState<Card[]>([]);
  const [trayCards, setTrayCards] = useState<Card[]>([]);
  // const [rowsData, setRowsData] = useState<{ [key: string]: Row }>({});
  const [rowsData, setRowsData] = useAtom(rowsDataATOM); // Using atoms makes it easier to access this state without going through pass props hell
  const [students, setStudents] = useState<StudentWithUser[]>([]);
  const [seating, setSeating] = useAtom(seatingATOM);
  const [selectedSeat, setSelectedSeat] = useState<UniqueIdentifier>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [presence, setPresence] = useAtom<Presence | undefined>(PresenceATOM);
  const [isPresenceModalOpen, setIsPresenceModalOpen] = useState(false);

  useEffect(() => {
    // RESETING GLOBAL CONTEXT STORE VARIABLES
    setPresence(undefined);
    setSeating({});
    setRowsData({});
    setRowsData({});
  }, []);

  const [draggedTrayCardId, setDraggedTrayCardId] =
    useState<UniqueIdentifier | null>(null);

  const [draggedTrayCardRender, setDraggedTrayCardRender] =
    useState<React.ReactNode>(null);

  const [transform, setTransform] = useState(zoomIdentity);

  const addDraggedTrayCardToCanvas = ({
    over,
    active,
    delta,
  }: DragEndEvent) => {
    setDraggedTrayCardId(null);
    // console.log(rowsData);
    // console.log(cards);

    if (over?.id !== "canvas") return;
    if (!active.rect.current.initial) return;

    const uid = generateNonBreaking(5);
    const activeID = active.id + "-" + uid;

    setCards([
      ...cards,
      {
        id: activeID,
        coordinates: calculateCanvasPosition(
          active.rect.current.initial,
          over,
          delta,
          transform
        ),
        text: active.id.toString(),
        type: active.data.current?.type,
        block: active.data.current?.block,
        utility: active.data.current?.utility,
      },
    ]);
  };

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const seanceData = await getSeanceData(params.id);
      setSeanceData(seanceData);
      setRowsData(createRowsData(seanceData));
      setCards(createCards(seanceData));
      setTrayCards(createTrayCardsFromStudents(seanceData.students));
      setStudents(seanceData.students);
      const studentSeating = await getStudentSeating(params.id);
      setSeating(transformSeatingData(studentSeating, seanceData.students));
      const studentPresence = await getStudentPresence(params.id);
      setPresence(studentPresence);
      router.refresh();
    }

    fetchData();
  }, []);

  function createCards(result: any): Card[] {
    return result.plan_rows.map((planRow: any) => {
      const { id, name, x, y } = planRow;

      return {
        id: id,
        coordinates: {
          x: parseFloat(x),
          y: parseFloat(y),
        },
        text: name,
        type: "row",
        block: <RowBlock />,
        utility: (
          <RowUtility
            id={id}
            editable={false}
            setSelectedSeat={setSelectedSeat}
            openDrawer={() => {
              setIsDrawerOpen(true);
            }}
          />
        ),
      };
    });
  }

  const handleSaveSeating = async () => {
    toast({
      title: "Seating is being saved...",
      description: "Awaiting....",
    });
    if ((await saveStudentSeating(params.id, seating)).success == true) {
      toast({
        title: "Success, Plan created!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(seating, null, 2)}
            </code>
          </pre>
        ),
      });
    }
  };

  const handleGenerateSeating = () => {
    if (!seanceData) return;

    const newSeating: Seating = {};

    const allSeats = seanceData.plan_rows.flatMap((row) =>
      row.seats.map((seat) => seat.id)
    );
    const shuffledSeats = allSeats.sort(() => Math.random() - 0.5);

    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

    shuffledStudents.forEach((student, index) => {
      if (index < shuffledSeats.length) {
        const seatId = shuffledSeats[index];

        if (!newSeating[seatId]) {
          newSeating[seatId] = {
            seat_id: seatId,
            student: student,
          };
        }
      }
    });

    setSeating(newSeating);
  };

  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (error) => {
        reject(new Error("Failed to load image: " + url));
      };
    });
  };

  const generatePDF = async () => {
    const doc = new jsPDF();

    const leftLogoUrl = "/images/image.png";
    const rightLogoUrl = "/images/uha_logo.png";

    const leftLogo = await loadImage(leftLogoUrl);
    const rightLogo = await loadImage(rightLogoUrl);

    const logoWidth = 30;
    const logoHeight = 30;
    doc.addImage(leftLogo, "PNG", 10, 10, logoWidth - 6, logoHeight - 10);
    doc.addImage(
      rightLogo,
      "PNG",
      doc.internal.pageSize.getWidth() - logoWidth - 15,
      10,
      logoWidth + 5,
      logoHeight - 10
    );

    let courseInfo = document.getElementById("course-info")?.innerText ?? "";
    let split = doc.splitTextToSize(courseInfo, 200);
    let heading = document.querySelector(".content > h1")?.innerHTML ?? "";

    doc.setTextColor(0, 0, 0);
    doc.text(heading, 75, 20);
    doc.text(split, 50, 30);

    const tableData = document.getElementById("student-table");
    if (tableData) {
      const rows = Array.from(tableData.querySelectorAll("tbody tr"));
      const data = await Promise.all(
        rows.map(async (row) => {
          const cells = row.querySelectorAll("td");
          const photoCell = cells[0];
          const imgElement =
            photoCell.querySelector("img") || photoCell.querySelector("svg");
          let imgData = "";

          if (imgElement) {
            if (imgElement instanceof HTMLImageElement) {
              imgData = imgElement.src;
            } else if (imgElement instanceof SVGSVGElement) {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (ctx) {
                const svg = new Blob([imgElement.outerHTML], {
                  type: "image/svg+xml;charset=utf-8",
                });
                const DOMURL = self.URL || self.webkitURL || self;
                const url = DOMURL.createObjectURL(svg);
                const img = new Image();
                img.src = url;
                await new Promise((resolve) => (img.onload = resolve));
                ctx.drawImage(img, 0, 0);
                imgData = canvas.toDataURL("image/png");
                DOMURL.revokeObjectURL(url);
              }
            }
          }

          return [
            imgData ? { content: "", image: imgData, fit: [30, 30] } : "",
            cells[1].innerText,
            cells[2].innerText,
            cells[3].innerText,
            "",
            "",
          ];
        })
      );

      autoTable(doc, {
        head: [
          ["Photo", "Name", "Student Number", "Seat Name", "Present", " "],
        ],
        body: data,
        startY: 50,
        styles: {
          fontSize: 10,
          valign: "middle",
          halign: "center",
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
        },
        columnStyles: {
          0: {
            halign: "center",
            minCellHeight: 15,
          },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            const { cell, doc } = data;
            const cellRaw = cell.raw as { image?: string } | null;

            if (cellRaw?.image) {
              var dim = data.cell.height - data.cell.padding("vertical");
              doc.addImage(
                cellRaw.image,
                "PNG",
                cell.x + 8,
                cell.y + 2,
                dim,
                dim
              );
            }
          }
        },
      });

      doc.output("dataurlnewwindow");
    }
  };

  return (
    <div className="bg-brand-gray-dark relative min-h-screen">
      {/* Presence Modal */}
      <PresenceModal
        students={students}
        isOpen={isPresenceModalOpen}
        setIsOpen={setIsPresenceModalOpen}
        seance_id={seanceData?.seances.id}
      />
      <div className="pt-28">
        <Separator />
      </div>
      <div className="h-full flex-col flex bg-brand-gray-dark ">
        <div className="px-[2.5%] flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold w-full">Sceance Explorer</h2>
          <Link href="/timeline">
            <Button
              className="ml-auto flex w-fit space-x-2 sm:justify-end "
              variant={"ghost"}
              asChild
            >
              <div className="flex gap-4">
                <ArrowLeftToLine />
                Return to timeline
              </div>
            </Button>
          </Link>
        </div>
        <Separator />
        <div className="px-[2.5%] h-full pt-6">
          <DndContext>
            <DndContext
            // onDragStart={({ active }) => {
            //   // console.log(active);
            //   setDraggedTrayCardId(active.id);
            //   setDraggedTrayCardRender(active.data.current?.block);
            // }}
            // onDragEnd={addDraggedTrayCardToCanvas}
            >
              <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px] ">
                <div className="content hidden printable w-full">
                  <h1 style={{ color: "black" }}>Seance Information</h1>
                  <div
                    id="course-info"
                    style={{
                      display: "none",
                      color: "black",
                      justifyContent: "center",
                    }}
                  >
                    Course: {seanceData?.courses.name} - Date:{" "}
                    {seanceData?.seances.day}/{seanceData?.seances.month}
                  </div>
                </div>

                <table
                  id="student-table"
                  className="hidden printable"
                  style={{
                    color: "black",
                    border: "1px solid black",
                    borderCollapse: "collapse",
                    width: "100%",
                    backgroundColor: "white",
                  }}
                >
                  <thead>
                    <tr style={{ color: "black", border: "1px solid black" }}>
                      <th style={{ border: "1px solid black" }}>Photo</th>
                      <th style={{ border: "1px solid black" }}>Name</th>
                      <th style={{ border: "1px solid black" }}>
                        Student Number
                      </th>
                      <th style={{ border: "1px solid black" }}>Seat Name</th>
                      <th style={{ border: "1px solid black" }}>Present</th>
                      <th style={{ border: "1px solid black" }}>In Seat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seating &&
                      Object.values(seating).map((seat) => (
                        <tr
                          key={seat.seat_id}
                          style={{
                            color: "black",
                            border: "1px solid black",
                          }}
                        >
                          <td style={{ border: "1px solid black" }}>
                            {seat.student.photo ? (
                              <img
                                src={seat.student.photo}
                                alt={
                                  seat.student.studentNumber
                                    ? seat.student.studentNumber
                                    : "99"
                                }
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <img
                                src="/images/icons/user.png"
                                alt={
                                  seat.student.studentNumber
                                    ? seat.student.studentNumber
                                    : "99"
                                }
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                          </td>
                          <td style={{ border: "1px solid black" }}>
                            {seat.student.user.lastName}{" "}
                            {seat.student.user.firstName}
                          </td>
                          <td style={{ border: "1px solid black" }}>
                            {seat.student.studentNumber}
                          </td>
                          <td style={{ border: "1px solid black" }}>
                            {
                              seanceData?.plan_rows
                                .flatMap((row) => row.seats)
                                .find((s) => s.id === seat.seat_id)?.seatName
                            }
                          </td>
                          <td style={{ border: "1px solid black" }}></td>
                          <td style={{ border: "1px solid black" }}></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {/* Parameters */}
                <div className="flex-col space-y-4 flex md:order-2 ">
                  {/* Seance Info */}
                  <p>Info</p>
                  <div className="pb-2 border-brand-gray-light">
                    <div className="flex gap-2 items-center">
                      <p className="text-white/40 text-sm">Name:</p>
                      <p className="text-sm text-brand-yellow">
                        {seanceData?.courses.name}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p className="text-white/40 text-sm">Classroom:</p>
                      <p className="text-sm text-brand-pink">
                        {seanceData?.classrooms.name}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p className="text-white/40 text-sm">Date:</p>
                      <p className="text-sm text-emerald-300">
                        {seanceData?.seances.day}/{seanceData?.seances.month}
                      </p>
                    </div>
                  </div>

                  {/* Tools */}
                  <p>Tools</p>
                  <div className="w-full">
                    <Button
                      className="w-full flex justify-between"
                      onClick={() => setIsPresenceModalOpen(true)}
                    >
                      Presence <UserRoundCheck />
                    </Button>
                  </div>

                  {/* Parameters */}
                  <p>Parameters</p>

                  {/* Are block names visible ? */}
                  <div className="flex space-x-3 items-center h-fit">
                    <Label htmlFor="is_block_name_visible" className="text-xs">
                      Show Names
                    </Label>
                    <Switch
                      id="is_block_name_visible"
                      name="is_block_name_visible"
                      checked={isBlockNameVisible}
                      onCheckedChange={(v) => setIsBlockNameVisible(v)}
                    />
                  </div>

                  {/* Seating */}
                  <p>Seating</p>

                  <div className="w-full">
                    <Button
                      className="w-full flex justify-between mb-2"
                      onClick={handleGenerateSeating}
                    >
                      Generate Seating <SendToBackIcon />
                    </Button>
                    <Button
                      onClick={generatePDF}
                      className="w-full flex justify-between mb-2"
                    >
                      Save as PDF <File />
                    </Button>
                    {seanceData && (
                      <GenerateRepositoriesModal seanceData={seanceData} />
                    )}

                    {/* Save Seating */}
                    <Button
                      className="w-full flex justify-between mt-4 border-[1px] border-white"
                      disabled={Object.keys(seating).length == 0}
                      variant={"secondary"}
                      onClick={() => handleSaveSeating()}
                    >
                      Save Seating <Save />
                    </Button>
                  </div>

                  {/* Blocks */}
                  {/* <p className="pt-3">Blocks</p>
                  <div className="grid grid-cols-2 gap-4 tray">
                    {trayCards.map((trayCard) => {
                      return <Addable card={trayCard} key={trayCard.id} />;
                    })}
                  </div> */}

                  <StudentDrawer
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    students={students}
                    selectedSeat={selectedSeat}
                  />
                </div>
                {/* Plan viewer */}
                <div className="md:order-1 ">
                  <div className="w-full h-full max-h-[700px] md:max-h-[800px] max-w-full border-2 border-brand-gray-light rounded-lg overflow-hidden ">
                    {/* Background */}
                    <div
                    // className="absolute w-full h-full min-h-screen left-3 top-3 bottom-3 right-3"
                    // style={{
                    //   backgroundImage: "url('/images/bg-dots.svg')",
                    //   backgroundRepeat: "repeat",
                    // }}
                    >
                      <Canvas
                        cards={cards}
                        setCards={setCards}
                        rowsData={rowsData}
                        setRowsData={setRowsData}
                        transform={transform}
                        setTransform={setTransform}
                      />
                      <DragOverlay>
                        <div className="trayOverlayCard">
                          {draggedTrayCardRender}
                        </div>
                      </DragOverlay>
                    </div>
                  </div>
                </div>
              </div>
            </DndContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
function createRowsData(result: any): RowsDataType {
  const rowsData: RowsDataType = {};

  result.plan_rows.forEach((planRow: any) => {
    const sortedSeats = planRow.seats.sort((a: any, b: any) =>
      a.seatName.localeCompare(b.seatName)
    );

    const row: Row = {
      id: planRow.id,
      name: planRow.name,
      cards: sortedSeats.map((seat: any) => ({
        id: seat.id,
        coordinates: {}, // Assuming seats don't have specific coordinates, otherwise add the correct data
        text: seat.seatName,
        block: <SeatBlock />,
        utility: <SeatUtility />,
        type: "seat",
      })),
    };

    rowsData[planRow.id] = row;
  });

  return rowsData;
}

function createTrayCardsFromStudents(students: any[]): Card[] {
  return students.map((student) => ({
    id: "Student-" + generateNonBreaking(5),
    coordinates: { x: 0, y: 0 },
    text: student.studentNumber,
    type: "student",
    block: <StudentBlock name={student.studentNumber} image={student.photo} />,
    utility: (
      <StudentBlock name={student.studentNumber} image={student.photo} />
    ),
  }));
}

function transformSeatingData(
  seatingEntries: (typeof studentSeatings.$inferSelect)[],
  students: StudentWithUser[]
): Seating {
  const seating: Seating = {};

  const studentMap = new Map<string, StudentWithUser>();
  students.forEach((student) => {
    studentMap.set(student.id, student);
  });

  // Transform each seating entry
  seatingEntries.forEach((entry) => {
    const student = studentMap.get(entry.studentId);
    if (student) {
      seating[entry.seatId] = {
        seat_id: entry.seatId,
        student: student,
      };
    }
  });

  return seating;
}
