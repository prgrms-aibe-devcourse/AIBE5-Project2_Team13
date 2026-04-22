import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/src/lib/utils';
import type { DropdownProps } from 'react-day-picker';

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disableFuture?: boolean;
  minDate?: string;
  placement?: 'top' | 'bottom';
  panelClassName?: string;
  className?: string;
};

const parseDateValue = (value: string) => {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value: string) => {
  const date = parseDateValue(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

function MonthDropdown(props: DropdownProps) {
  const selectedMonth = typeof props.value === 'number' ? props.value : Number(props.value ?? 0);
  const monthLabel = `${selectedMonth + 1}월`;

  return (
    <span className="relative inline-flex min-w-[82px]">
      <select
        {...props}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
      >
        {props.options?.map(({ value, disabled }) => (
          <option key={value} value={value} disabled={disabled}>
            {value + 1}월
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-2 text-center shadow-sm"
      >
        <span className="text-sm font-bold leading-none text-gray-900">{monthLabel}</span>
        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </span>
    </span>
  );
}

export default function DatePicker({
  value,
  onChange,
  placeholder = '날짜를 선택해주세요',
  disabled = false,
  disableFuture = false,
  minDate,
  placement = 'bottom',
  panelClassName,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const minSelectableDate = useMemo(() => parseDateValue(minDate ?? ''), [minDate]);
  const [viewMonth, setViewMonth] = useState<Date | undefined>(selectedDate);

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left outline-none transition-all',
          'bg-ivory border-transparent hover:border-coral/40 focus:border-coral',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <CalendarDays size={18} className="shrink-0 text-gray-400" />
        <span className={cn('text-sm font-medium', value ? 'text-gray-900' : 'text-gray-400')}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 z-50 w-full min-w-[300px] rounded-[28px] border border-coral/10 bg-white p-4 shadow-2xl',
            placement === 'top' ? 'bottom-[calc(100%+24px)]' : 'top-[calc(100%+12px)]',
            panelClassName
          )}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            month={viewMonth}
            onMonthChange={setViewMonth}
            onSelect={(date) => {
              if (!date) {
                return;
              }
              setViewMonth(date);
              onChange(formatDateValue(date));
              setIsOpen(false);
            }}
            showOutsideDays
            captionLayout="dropdown"
            startMonth={minSelectableDate ?? new Date(1950, 0)}
            endMonth={disableFuture ? new Date() : new Date(2100, 11)}
            disabled={{
              ...(disableFuture ? { after: new Date() } : {}),
              ...(minSelectableDate ? { before: minSelectableDate } : {}),
            }}
            classNames={{
              root: 'w-full',
              months: 'flex justify-center',
              month: 'w-full space-y-4',
              month_caption: 'relative flex items-center justify-center px-14 pt-1',
              caption_label: 'hidden',
              nav: 'absolute inset-x-0 top-0 z-10 flex items-center justify-between px-1 pointer-events-none',
              button_previous: 'pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-coral hover:text-coral',
              button_next: 'pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-coral hover:text-coral',
              dropdowns: 'flex flex-row-reverse items-center gap-2',
              dropdown_root: 'relative',
              dropdown: 'rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 outline-none',
              weekdays: 'mt-3 grid grid-cols-7',
              weekday: 'text-center text-xs font-bold text-gray-400',
              week: 'mt-2 grid grid-cols-7',
              day: 'flex items-center justify-center',
              day_button: 'h-10 w-10 rounded-2xl text-sm font-semibold text-gray-700 transition-all hover:bg-coral/10 hover:text-coral',
              today: 'text-coral',
              selected: 'rounded-2xl bg-coral text-white hover:bg-coral hover:text-white',
              outside: 'text-gray-300',
              disabled: 'text-gray-300 opacity-50',
            }}
            components={{
              Chevron: ({ orientation, ...props }) =>
                orientation === 'left' ? <ChevronLeft size={18} {...props} /> : <ChevronRight size={18} {...props} />,
              MonthsDropdown: MonthDropdown,
            }}
          />
        </div>
      )}
    </div>
  );
}
