"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerProps {
  value?: number | null;
  onChange: (date: number | null) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => (value ? new Date(value) : new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return d.getTime() < today.getTime();
  };

  const todayDate = new Date();
  const isPrevMonthDisabled = year < todayDate.getFullYear() || (year === todayDate.getFullYear() && month <= todayDate.getMonth());

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(year, month, day);
    if (isPast(selected)) return;
    onChange(selected.getTime());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  // Calendar rendering math
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const daysGrid: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Previous month days fill
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    daysGrid.push({
      day: prevDay,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevDay)
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Next month days fill to make complete weeks (42 cells)
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const formattedValue = value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : null;

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    const sel = new Date(value);
    return (
      date.getDate() === sel.getDate() &&
      date.getMonth() === sel.getMonth() &&
      date.getFullYear() === sel.getFullYear()
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold select-none transition-all cursor-pointer ${
          isOpen
            ? "border-white/20 bg-white/[0.08] text-white"
            : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/[0.08]"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className={formattedValue ? "text-zinc-100" : "text-zinc-550"}>
            {formattedValue || placeholder}
          </span>
        </div>
        {value && (
          <span
            onClick={handleClear}
            className="p-0.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 bottom-full mb-2 z-50 w-[260px] rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl p-3 shadow-2xl"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-zinc-200">
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={isPrevMonthDisabled}
                  className={`p-1 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer ${
                    isPrevMonthDisabled ? "opacity-30 pointer-events-none" : "hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Days of week row */}
            <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
              {weekDays.map((day) => (
                <span key={day} className="text-[10px] font-bold text-zinc-550">
                  {day}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysGrid.map(({ day, isCurrentMonth, date }, idx) => {
                const today = isToday(date);
                const selected = isSelected(date);
                const past = isPast(date);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(date.getDate())}
                    disabled={!isCurrentMonth || past}
                    className={`h-7 w-7 rounded-lg text-[10px] font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      !isCurrentMonth || past
                        ? "text-zinc-700/40 pointer-events-none"
                        : selected
                        ? "bg-white text-zinc-950 font-black shadow-md shadow-white/10"
                        : today
                        ? "bg-white/10 text-white border border-white/10"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Today Button */}
            <div className="mt-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  onChange(today.getTime());
                  setIsOpen(false);
                }}
                className="w-full text-center text-xs font-bold py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all cursor-pointer"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
