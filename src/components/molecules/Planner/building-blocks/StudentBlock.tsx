import { UserCircleIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

interface StudentBlockProps {
  name: string;
  image: string;
}

const StudentBlock = ({ name, image }: StudentBlockProps) => (
  <div className="group select-none relative aspect-square w-full max-w-[120px] bg-brand-gray-light rounded flex items-center justify-center hover:opacity-80 duration-200 hover:cursor-grab">
    {image ? (
      <Image
        src={image}
        alt="seat icon"
        className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
        width={70}
        height={70}
      />
    ) : (
      <UserCircleIcon
        className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
        width={45}
        height={45}
      />
    )}
    <div className="absolute bottom-0 text-xs">{name}</div>
  </div>
);

export default StudentBlock;
