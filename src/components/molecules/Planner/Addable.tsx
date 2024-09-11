import { Card } from "@/app/(room-planner)/planner/page";
import { generateNonBreaking } from "@/lib/utils/generate-password";
import { useDraggable } from "@dnd-kit/core";

export const Addable = ({ card }: { card: Card }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: card.id,
    data: {
      block: card.block,
      utility: card.utility,
      type: card.type,
      cards: card.cards,
    },
  });

  return (
    <div className="trayCard" ref={setNodeRef} {...listeners} {...attributes}>
      {card.block && card.block}
      {/* {card.text} */}
    </div>
  );
};
