"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PopoverProps } from "@radix-ui/react-popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";

const presets = [
  {
    name: "September",
    value: 9,
  },
  {
    name: "October",
    value: 10,
  },
  {
    name: "November",
    value: 11,
  },
  {
    name: "December",
    value: 12,
  },
  {
    name: "January",
    value: 0,
  },
  {
    name: "February",
    value: 1,
  },
  {
    name: "March",
    value: 2,
  },
  {
    name: "April",
    value: 3,
  },
  {
    name: "May",
    value: 4,
  },
  {
    name: "Juin",
    value: 5,
  },
];

type PresetType = typeof presets extends (infer T)[] ? T : never;

interface MonthSelectorProps {
  daysInterval: {
    start: number;
    end: number;
    month: number;
    year: number;
  };
  setDaysInterval: React.Dispatch<
    React.SetStateAction<{
      start: number;
      end: number;
      month: number;
      year: number;
    }>
  >;

  revalidate: (month: number) => void;
}

export function MonthSelector({
  daysInterval,
  setDaysInterval,
  revalidate,
}: MonthSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const router = useRouter();

  const monthDate = new Date();
  monthDate.setMonth(daysInterval.month - 1);
  const monthName = monthDate.toLocaleString("default", { month: "long" });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Change month..."
          aria-expanded={open}
          className="flex-1 justify-between md:max-w-[200px] lg:max-w-[300px] bg-brand-gray-light"
        >
          {daysInterval ? monthName : "Change month..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search month..." />
          <CommandEmpty>No months found.</CommandEmpty>
          <CommandGroup heading="Months">
            <CommandList>
              {presets.map((preset, index: number) => (
                <CommandItem
                  key={index}
                  onSelect={() => {
                    setDaysInterval((prev) => ({
                      start: 1,
                      end: 6,
                      month: preset.value + 1,
                      year: prev.year,
                    }));
                    setOpen(false);
                    router.push(
                      `/timeline?day=1&month=${preset.value + 1}&year=${
                        daysInterval.year
                      }`
                    );
                    revalidate(preset.value + 1);
                  }}
                >
                  {preset.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      daysInterval?.month === preset.value + 1
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
          {/* <Separator />
          <CommandGroup className="pt-0">
            <CommandItem onSelect={() => router.push("#")}>
              Add More...
            </CommandItem>
          </CommandGroup> */}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
