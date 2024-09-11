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
    name: "R-TP-A",
    numberOfRows: 8,
    numberOfSeats: 64,
  },
  {
    name: "R-TP-B",
    numberOfRows: 4,
    numberOfSeats: 52,
  },
  {
    name: "R-TP-C",
    numberOfRows: 6,
    numberOfSeats: 80,
  },
  {
    name: "R-Amphi-A",
    numberOfRows: 14,
    numberOfSeats: 134,
  },
  {
    name: "R-Amphi-B",
    numberOfRows: 16,
    numberOfSeats: 156,
  },
];

type PresetType = typeof presets extends (infer T)[] ? T : never;

export function PresetSelector() {
  const [open, setOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<PresetType>();
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Load a preset..."
          aria-expanded={open}
          className="flex-1 justify-between md:max-w-[200px] lg:max-w-[300px] bg-brand-gray-light"
        >
          {selectedPreset ? selectedPreset.name : "Load a preset..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search presets..." />
          <CommandEmpty>No presets found.</CommandEmpty>
          <CommandGroup heading="Preset Plans">
            <CommandList>
              {presets.map((preset, index: number) => (
                <CommandItem
                  key={index}
                  onSelect={() => {
                    setSelectedPreset(preset);
                    setOpen(false);
                  }}
                >
                  {preset.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedPreset?.name === preset.name
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
          <Separator />
          <CommandGroup className="pt-0">
            <CommandItem onSelect={() => router.push("#")}>
              Add More...
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
