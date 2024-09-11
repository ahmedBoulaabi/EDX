import Image from "next/image";

interface RowWithSeatsProps {
  numberOfSeats: number;
}

export default function RowWithSeats({ numberOfSeats }: RowWithSeatsProps) {
  return (
    <div className="group aspect-square w-full relative bg-brand-gray-light rounded flex items-center justify-center hover:opacity-80 duration-200 hover:cursor-grab">
      <p className="absolute font-black right-5 text-[#929292] opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none">
        x {numberOfSeats}
      </p>
      <Image
        src="/images/icons/row-with-seats.png"
        alt="row icon"
        className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
        width={70}
        height={70}
      />
    </div>
  );
}
