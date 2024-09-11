import Image from "next/image";

export default function SeatBlock() {
  return (
    <div className="group select-none aspect-square w-full max-w-[120px] bg-brand-gray-light rounded flex items-center justify-center hover:opacity-80 duration-200 hover:cursor-grab">
      <Image
        src="/images/icons/chair.png"
        alt="seat icon"
        className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
        width={70}
        height={70}
      />
    </div>
  );
}
