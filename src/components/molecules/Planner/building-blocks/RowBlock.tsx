import Image from "next/image";

export default function RowBlock() {
  return (
    <div className="group aspect-square w-full bg-brand-gray-light rounded flex items-center justify-center hover:opacity-80 duration-200 hover:cursor-grab">
      <Image
        src="/images/icons/row.png"
        alt="row icon"
        className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
        width={70}
        height={70}
      />
    </div>
  );
}
