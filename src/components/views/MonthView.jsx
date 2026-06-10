import React, { useRef, useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfDay,
  endOfDay
} from 'date-fns';
import { getEventsForDate } from '../../utils/dataProcessor';
import EventChip from './EventChip';
import Tooltip, { DateTooltip, EventTooltip } from '../ui/tooltip';
import { computeWeekBars, HEADER_HEIGHT, BAR_HEIGHT, LANE_GAP, MORE_HEIGHT } from '../../utils/weekBars';

function MonthView({
  currentDate,
  events,
  settings,
  onEventClick,
  onEventModalOpen,
  onEventPreviewOpen,
  onDayEventsOpen,
  onDateClick,
  mini = false
}) {
  // Measure the rendered grid height so content scales to the element size.
  // Declared at the top (before any early return) to satisfy rules-of-hooks.
  const gridRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setContainerHeight(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: settings.weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: settings.weekStartsOn });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (settings.weekStartsOn === 1) {
    weekDays.push(weekDays.shift());
  }

  // Mini view - compact like YearView but for current month only
  if (mini) {
    const miniWeekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    if (settings.weekStartsOn === 1) {
      miniWeekDays.push(miniWeekDays.shift());
    }

    return (
      <div className="h-full p-4">
        <h3 className="text-lg font-semibold mb-3 text-center">
          {format(currentDate, 'MMMM yyyy')}
        </h3>

        <div className="grid grid-cols-7 gap-1 max-w-full">
          {/* Mini weekday headers */}
          {miniWeekDays.map((day, index) => (
            <div key={index} className="text-xs text-center text-muted-foreground p-1">
              {day}
            </div>
          ))}

        {/* Mini calendar days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const tooltipContent = dayEvents.length > 0 ? (
            <div className="text-center">
              <div className="font-semibold mb-1">
                {format(day, 'EEEE, MMMM d')}
              </div>
              <div className="text-xs text-gray-300 dark:text-gray-600 mb-2">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </div>
              {dayEvents.slice(0, 3).map(event => (
                <div key={event.id} className="text-xs mb-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: event.color }}
                  />
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          ) : null;

            const interactionMode = settings.eventInteractionMode || 'auto';
            const allowPreviewModal = interactionMode !== 'tooltip';

            const dayComponent = (
              <div
                className={`
                  text-xs p-1 text-center relative cursor-pointer hover:bg-muted/50 rounded min-h-5
                  ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                  ${isTodayDate ? 'bg-blue-100 dark:bg-blue-950/30' : ''}
                `}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    if (allowPreviewModal) {
                      onEventPreviewOpen && onEventPreviewOpen(dayEvents[0]);
                    } else {
                      onEventClick && onEventClick(dayEvents[0].id, format(day, 'yyyy-MM-dd'), dayEvents[0]);
                    }
                  } else {
                    onDateClick && onDateClick(day);
                  }
                }}
              >
                {format(day, 'd')}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );

            return (
              <div key={day.toISOString()} className="text-center">
                {dayEvents.length > 0 && tooltipContent && settings.showEventTooltips ? (
                  <Tooltip content={tooltipContent} delay={settings.tooltipDelay}>
                    {dayComponent}
                  </Tooltip>
                ) : settings.showDateTooltips ? (
                  <DateTooltip date={day} onDateClick={onDateClick}>
                    {dayComponent}
                  </DateTooltip>
                ) : (
                  dayComponent
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Group days into weeks of 7
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // The dropdown setting acts as a MINIMUM row height. Rows then grow to fill
  // the calendar element, so resizing the element bigger enlarges the rows
  // (and everything that scales off them) — not just empty space at the bottom.
  const minRowHeight = settings.monthRowHeight || 110;

  // Effective per-row height: whichever is larger — the setting's minimum, or
  // the height each row gets when filling the measured container.
  const measuredRowHeight = containerHeight > 0 ? containerHeight / weeks.length : 0;
  const effectiveRowHeight = Math.max(minRowHeight, measuredRowHeight);

  // The user's "max events per day" cap (0 = no explicit limit).
  const hardCap = settings.dayMaxEvents === 0
    ? Infinity
    : Math.max(1, settings.dayMaxEvents || 3);

  // Scale the day-number font with the effective row height so dates grow as
  // the calendar grows. Clamped to a sensible range (~13px–28px).
  const dayNumberFontSize = Math.max(13, Math.min(28, Math.round(8 + effectiveRowHeight * 0.06)));

  // Reserve header space for the (now scalable) day number.
  const headerOffset = Math.max(HEADER_HEIGHT, dayNumberFontSize + 12);

  // How many event lanes physically fit in the effective row height, so bars
  // never overflow into the next row and collide with its day numbers. Two
  // variants: one assuming no "+N more" line is needed, one reserving for it.
  const laneUnit = BAR_HEIGHT + LANE_GAP;
  const fitNoMore = Math.max(1, Math.floor((effectiveRowHeight - headerOffset) / laneUnit));
  const fitWithMore = Math.max(1, Math.floor((effectiveRowHeight - headerOffset - MORE_HEIGHT) / laneUnit));

  const getEventClickHandler = (event, day) => {
    const mode = settings.eventInteractionMode || 'auto';
    if (mode === 'tooltip') {
      return () => onEventClick && onEventClick(event.id, format(day, 'yyyy-MM-dd'), event);
    }
    return () => onEventModalOpen && onEventModalOpen(event);
  };

  // Pre-compute bars for every week. The visible lane cap is whichever is
  // smaller: the user's max-events setting, or what fits in the row height.
  const allWeekData = weeks.map((week) => {
    const weekBars = computeWeekBars(week, events);
    const totalLanes = weekBars.reduce((m, b) => Math.max(m, b.lane + 1), 0);

    // If everything fits without a "+more" line, show it all; otherwise cap to
    // what fits alongside the "+more" line and overflow the rest.
    const fitsAll = totalLanes <= Math.min(hardCap, fitNoMore);
    const visibleCap = fitsAll ? totalLanes : Math.min(hardCap, fitWithMore);

    const visibleBars = weekBars.filter((b) => b.lane < visibleCap);
    const hiddenBars = weekBars.filter((b) => b.lane >= visibleCap);
    const usedLanes = Math.min(visibleCap, totalLanes);
    return { weekBars, visibleBars, hiddenBars, usedLanes };
  });

  // Regular month view
  return (
    <div className="h-full flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid — each week is a row with absolutely positioned event bars */}
      <div ref={gridRef} className="flex-1 flex flex-col overflow-y-auto">
        {weeks.map((week, weekIdx) => {
          const { visibleBars, hiddenBars } = allWeekData[weekIdx];

          // Per-day count of hidden events for "+N more" link
          const hiddenPerDay = week.map((d) => {
            const dStart = startOfDay(d).getTime();
            const dEnd = endOfDay(d).getTime();
            return hiddenBars
              .map((b) => b.event)
              .filter((e) => {
                const eS = startOfDay(e.start).getTime();
                const eE = endOfDay(e.end || e.start).getTime();
                return eS <= dEnd && eE >= dStart;
              });
          });

          return (
            <div
              key={weekIdx}
              className="relative grid grid-cols-7 overflow-hidden flex-1"
              style={{ minHeight: `${minRowHeight}px` }}
            >
              {/* Day cells (background, date number, "+N more") */}
              {week.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const hidden = hiddenPerDay[dayIdx];

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      border-r border-b border-border p-2 flex flex-col
                      ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                      ${isTodayDate ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
                    `}
                  >
                    {/* Day number with date tooltip — fixed-height area so the
                        flow below it lines up with the absolutely-placed bars */}
                    <div className="flex items-start" style={{ height: `${headerOffset}px` }}>
                      {settings.showDateTooltips ? (
                        <DateTooltip date={day} onDateClick={onDateClick}>
                          <div
                            className={`
                              font-medium cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5 inline-block w-fit leading-tight
                              ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}
                            `}
                            style={{ fontSize: `${dayNumberFontSize}px` }}
                          >
                            {format(day, 'd')}
                          </div>
                        </DateTooltip>
                      ) : (
                        <div
                          className={`
                            font-medium cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5 inline-block w-fit leading-tight
                            ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}
                          `}
                          style={{ fontSize: `${dayNumberFontSize}px` }}
                          onClick={() => onDateClick && onDateClick(day)}
                        >
                          {format(day, 'd')}
                        </div>
                      )}
                    </div>

                    {/* Reserve space for absolutely-positioned bars */}
                    <div
                      className="pointer-events-none"
                      style={{ height: `${allWeekData[weekIdx].usedLanes * (BAR_HEIGHT + LANE_GAP)}px` }}
                    />

                    {/* "+N more" link */}
                    {hidden.length > 0 && (
                      <div
                        className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => {
                          const dayEvents = getEventsForDate(events, day);
                          onDayEventsOpen && onDayEventsOpen(day, dayEvents);
                        }}
                      >
                        +{hidden.length} more
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Absolutely positioned event bars layered over the cells */}
              {visibleBars.map((bar) => {
                const { event, startCol, endCol, lane, clippedStart, clippedEnd } = bar;
                const span = endCol - startCol + 1;
                const left = `calc(${(startCol / 7) * 100}% + 4px)`;
                const width = `calc(${(span / 7) * 100}% - 8px)`;
                const top = `${headerOffset + lane * (BAR_HEIGHT + LANE_GAP)}px`;

                const handleClick = getEventClickHandler(event, event.start);

                const chip = (
                  <EventChip
                    event={event}
                    onClick={handleClick}
                    compact={true}
                    multiDay={endCol > startCol}
                    clippedStart={clippedStart}
                    clippedEnd={clippedEnd}
                  />
                );

                const wrapped = (!settings.showEventTooltips || settings.eventInteractionMode === 'modal')
                  ? chip
                  : (
                    <EventTooltip event={event} delay={settings.tooltipDelay} triggerClassName="block w-full">
                      {chip}
                    </EventTooltip>
                  );

                return (
                  <div
                    key={`${event.id}-${weekIdx}-${lane}`}
                    className="absolute"
                    style={{ left, width, top, height: `${BAR_HEIGHT}px` }}
                  >
                    {wrapped}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;
