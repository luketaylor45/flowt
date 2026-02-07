"use strict";
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center mb-2",
                caption_label: "text-sm font-bold text-zinc-200 tracking-tight",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-zinc-900 border-white/5 p-0 opacity-50 hover:opacity-100 transition-opacity"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full mb-2 border-b border-white/5 pb-2",
                head_cell:
                    "text-zinc-500 rounded-md font-extrabold text-[10px] uppercase tracking-[0.2em] text-center flex-1",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative flex-1 flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-bold text-zinc-400 hover:bg-white/5 hover:text-white rounded-xl transition-all aria-selected:opacity-100"
                ),
                day_selected:
                    "bg-blue-600 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-600 focus:text-white rounded-xl shadow-lg shadow-blue-600/20 ring-2 ring-blue-500/20",
                day_today: "bg-zinc-800 text-blue-400 border border-blue-500/20 rounded-xl",
                day_outside:
                    "day-outside text-zinc-700 opacity-50 aria-selected:bg-zinc-800/50 aria-selected:text-zinc-700 aria-selected:opacity-30",
                day_disabled: "text-zinc-500 opacity-50",
                day_range_middle:
                    "aria-selected:bg-zinc-800 aria-selected:text-zinc-200",
                day_hidden: "invisible",
                ...classNames,
            }}

            {...props}
        />
    );
}
Calendar.displayName = "Calendar";

export { Calendar };
