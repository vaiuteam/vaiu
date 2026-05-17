"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Navigate } from "react-big-calendar";

import { enUS } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Issue } from "../types";
import { format, getDay, parse, startOfWeek } from "date-fns";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";
import { EventCard } from "./event-card";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalendarProps {
  data: Issue[];
}

type NavigateAction = (typeof Navigate)[keyof typeof Navigate];

interface CustomToolbarProps {
  label: string;
  onNavigate: (action: NavigateAction) => void;
}

const CustomToolbar = ({ label, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-lg"
          aria-label="Previous month"
          onClick={() => onNavigate(Navigate.PREVIOUS)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-3 sm:flex-initial">
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-center text-sm font-semibold">
            {label}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-lg"
          aria-label="Next month"
          onClick={() => onNavigate(Navigate.NEXT)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full rounded-lg sm:w-auto"
        onClick={() => onNavigate(Navigate.TODAY)}
      >
        Today
      </Button>
    </div>
  );
};

export const DataCalander = ({ data }: DataCalendarProps) => {
  const [cursor, setCursor] = useState(
    () => (data.length > 0 ? new Date(data[0].dueDate) : new Date()),
  );

  const events = useMemo(
    () =>
      data.map((task: Issue) => ({
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        title: task.name,
        project: task.project,
        assignee: task.assignee,
        status: task.status,
        id: task.$id,
      })),
    [data],
  );

  return (
    <div className="data-issues-calendar rounded-xl border border-border/80 bg-card/40 px-4 py-3 shadow-sm backdrop-blur-sm dark:bg-card/30 md:px-5 md:py-4">
      <Calendar
        className="min-h-[34rem]"
        localizer={localizer}
        date={cursor}
        onNavigate={(next) => setCursor(next)}
        events={events}
        views={["month"]}
        defaultView="month"
        /* Shared week scroll strip (adjacent cells scroll together) only when true — keep false */
        showAllEvents={false}
        popup
        popupOffset={{ x: 10, y: 10 }}
        toolbar
        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        formats={{
          weekdayFormat: (d, culture, loc) =>
            loc?.format(d, "EEE", culture) ?? "",
        }}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              label={props.label}
              onNavigate={props.onNavigate}
            />
          ),
          eventWrapper: ({ event }) => (
            <EventCard
              id={event.id}
              title={event.title}
              project={event.project}
              assignee={event.assignee}
              status={event.status}
            />
          ),
        }}
      />
    </div>
  );
};
