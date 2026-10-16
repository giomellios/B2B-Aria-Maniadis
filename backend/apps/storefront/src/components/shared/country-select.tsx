"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "@/design-system/icons";
import { cn } from "@/lib/utils";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/design-system";
import { useT } from "@/lib/i18n/provider";

interface Country {
  code: string;
  name: string;
}

interface CountrySelectProps {
  countries: Country[];
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function CountrySelect({ countries, value, onValueChange, disabled }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const t = useT().address;
  const selectedCountry = countries.find((country) => country.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCountry ? selectedCountry.name : t.selectCountry}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={t.searchCountry} />
          <CommandList>
            <CommandEmpty>{t.noCountry}</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onValueChange(country.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {country.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
