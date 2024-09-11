import { Card, Row } from "@/app/(room-planner)/planner/page";
import { useDraggable } from "@dnd-kit/core";
import { Dispatch, SetStateAction } from "react";
import RowUtility from "./utilities/RowUtility";
import { ZoomTransform } from "d3-zoom";

interface RowDraggableProps {
  card: Card;
  canvasTransform: ZoomTransform;
  setCards: Dispatch<SetStateAction<Card[]>>;
}

export const RowDraggable = ({
  card,
  canvasTransform,
  setCards,
}: RowDraggableProps) => {
  // hook up to DndKit
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
  });
  return (
    <div
      className="card"
      style={{
        position: "absolute",
        top: `${card.coordinates.y * canvasTransform.k}px`,
        left: `${card.coordinates.x * canvasTransform.k}px`,
        transformOrigin: "top left",
        ...(transform
          ? {
              // temporary change to this position when dragging
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(${canvasTransform.k})`,
            }
          : {
              // zoom to canvas zoom
              transform: `scale(${canvasTransform.k})`,
            }),
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        listeners?.onPointerDown?.(e);
        e.preventDefault();
      }}
    >
      {card.id.toString().split("-")[0].toLowerCase() === "row" ? (
        <RowUtility id={card.id} setCards={setCards} />
      ) : (
        card.utility
      )}
    </div>
  );
};
