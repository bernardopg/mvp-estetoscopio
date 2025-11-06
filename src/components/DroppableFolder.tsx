"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableFolderProps {
  id: number | string;
  children: ReactNode;
}

export default function DroppableFolder({
  id,
  children,
}: DroppableFolderProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? "rgba(59, 130, 246, 0.1)" : undefined,
    border: isOver ? "2px dashed rgba(59, 130, 246, 0.5)" : undefined,
    transition: "all 0.2s ease",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
