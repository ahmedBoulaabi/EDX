import { Card, Row, RowsDataType } from "@/app/(room-planner)/planner/page";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  Active,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  Over,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { Draggable } from "./Draggable";
import { RowDraggable } from "./RowDraggable";
import { ZoomTransform, zoom } from "d3-zoom";
import { select } from "d3";

interface CanvasProps {
  cards: Card[];
  setCards: Dispatch<SetStateAction<Card[]>>;
  transform: ZoomTransform;
  setTransform(transform: ZoomTransform): void;
  rowsData: RowsDataType;
  setRowsData: Dispatch<
    SetStateAction<{
      [key: string]: Row;
    }>
  >;
}

export const Canvas = ({
  cards,
  setCards,
  transform,
  setTransform,
  rowsData,
  setRowsData,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  const updateAndForwardRef = (div: HTMLDivElement) => {
    canvasRef.current = div;
    setNodeRef(div);
  };

  const zoomBehavior = useMemo(() => zoom<HTMLDivElement, unknown>(), []);

  const updateTransform = useCallback(
    ({ transform }: { transform: ZoomTransform }) => {
      setTransform(transform);
    },
    [setTransform]
  );

  // Handling the pan and zoom using d3-zoom
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    // subscribing to the zoom to get notified on changes
    zoomBehavior.on("zoom", updateTransform);
    select<HTMLDivElement, unknown>(canvasRef.current).call(zoomBehavior);
  }, [zoomBehavior, canvasRef, updateTransform]);

  // Canvas sensors (we need this to be able to capture mouse clicks)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 0.02,
    },
  });
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { tolerance: 0.2, delay: 0.2, distance: 0.2 },
  });
  const touchSensor = useSensor(TouchSensor);

  const sensors = useSensors(mouseSensor, touchSensor, pointerSensor);

  const handleOverRow = (over: Over, active: Active) => {
    if (isRow(active?.id) || !active) return;

    if (over && active && isRow(over.id)) {
      const card = cards.find((c) => c.id === active.id);
      if (!card) return;
      let newRowsData = rowsData;

      // if (rowsData[over.id].cards.findIndex(card) == -1) return;
      newRowsData[over.id].cards.push(card);
      setRowsData(newRowsData);
      // console.log(rowsData);
      setCards(cards.filter((c) => c.id !== card.id));
    }
  };

  const isRow = (id: UniqueIdentifier) => {
    return id.toString().split("-")[0].toLowerCase() === "row";
  };

  const saveDragEndPosition = ({ delta, active, over }: DragEndEvent) => {
    if (!delta.x && !delta.y) return;

    setCards(
      cards.map((card) => {
        if (card.id === active.id) {
          return {
            ...card,
            coordinates: {
              x: card.coordinates.x + delta.x / transform.k,
              y: card.coordinates.y + delta.y / transform.k,
            },
          };
        }
        return card;
      })
    );
    if (over != null) {
      handleOverRow(over, active);
    }
  };

  return (
    <div
      ref={updateAndForwardRef}
      className="canvasWindow hover:cursor-grab printWhite"
      style={{
        backgroundImage: "url('/images/bg-dots.svg')",
        backgroundRepeat: "repeat",
        backgroundPositionX: transform.x,
        backgroundPositionY: transform.y,
        backgroundSize: transform.k * 500,
      }}
    >
      <div
        className="canvas h-full w-full"
        style={{
          // Applying the transform from d3
          transformOrigin: "top left",
          transform: `translate3d(${transform.x}px, ${transform.y}px, ${transform.k}px)`,
          position: "relative",
          minHeight: "800px", // TODO: I need to make this dynamic later
        }}
      >
        <DndContext
          sensors={sensors}
          onDragEnd={saveDragEndPosition}
          // onDragOver={(e) => console.log(e)}
        >
          {cards.map((card) =>
            card.type === "row" ? (
              <RowDraggable
                key={card.id}
                card={card}
                canvasTransform={transform}
                setCards={setCards}
              />
            ) : (
              <Draggable
                card={card}
                key={card.id}
                canvasTransform={transform}
              />
            )
          )}
        </DndContext>
      </div>
    </div>
  );
};
