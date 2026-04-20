import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import { Input } from "@acme/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";

import {
  parseLocalInputValue,
  splitDateTimeLocal,
  toLocalInputValue,
} from "~/features/pages/lib/datetime-local";

export function DateTimeLocalPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const parsed = parseLocalInputValue(value);
  const selectedDate = parsed !== null ? new Date(parsed) : undefined;
  const timeValue = splitDateTimeLocal(value).time;

  function handleSelectDate(date: Date | undefined) {
    if (!date) return;
    const { time } = splitDateTimeLocal(value);
    const [hh, mm] = (time || "00:00").split(":");
    const next = new Date(date);
    next.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
    onChange(toLocalInputValue(next.getTime()));
  }

  function handleTimeChange(nextTime: string) {
    const { date } = splitDateTimeLocal(value);
    const base = date || splitDateTimeLocal(toLocalInputValue(Date.now())).date;
    onChange(`${base}T${nextTime}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Open calendar"
          >
            <CalendarIcon className="size-4" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-3" align="end">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelectDate}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t pt-3">
          <label
            htmlFor="schedule-draft-time"
            className="text-muted-foreground text-xs"
          >
            Time
          </label>
          <Input
            id="schedule-draft-time"
            type="time"
            value={timeValue}
            onChange={(event) => handleTimeChange(event.target.value)}
            className="h-8 w-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
