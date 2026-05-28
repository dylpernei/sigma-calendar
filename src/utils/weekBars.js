import {
  startOfDay,
  endOfDay,
  isSameDay,
  differenceInCalendarDays
} from 'date-fns';

export const HEADER_HEIGHT = 28;
export const BAR_HEIGHT = 20;
export const LANE_GAP = 2;
export const MORE_HEIGHT = 18;

// True if the event covers more than one calendar day
export const isMultiDay = (event) =>
  event.end && !isSameDay(startOfDay(event.start), startOfDay(event.end));

// For one week (7 days), compute bar placements for every event that
// intersects the week. Each bar gets a lane (vertical row index) so bars
// don't overlap. Order: multi-day first, then start-asc, then duration-desc
// — gives continuous spans the top lanes.
export function computeWeekBars(weekDays, events) {
  const weekStartTs = startOfDay(weekDays[0]).getTime();
  const weekEndTs = endOfDay(weekDays[6]).getTime();

  const intersecting = events
    .filter((e) => {
      const eStart = startOfDay(e.start).getTime();
      const eEnd = endOfDay(e.end || e.start).getTime();
      return eStart <= weekEndTs && eEnd >= weekStartTs;
    })
    .sort((a, b) => {
      const aMulti = isMultiDay(a);
      const bMulti = isMultiDay(b);
      if (aMulti !== bMulti) return aMulti ? -1 : 1;
      const startDiff = a.start.getTime() - b.start.getTime();
      if (startDiff !== 0) return startDiff;
      return (b.end - b.start) - (a.end - a.start);
    });

  const bars = [];
  const lanes = []; // lanes[laneIdx] = [[startCol, endCol], ...]

  for (const event of intersecting) {
    const rawStart = differenceInCalendarDays(event.start, weekDays[0]);
    const rawEnd = differenceInCalendarDays(event.end || event.start, weekDays[0]);
    const startCol = Math.max(0, rawStart);
    const endCol = Math.min(6, rawEnd);
    if (endCol < startCol) continue;

    let laneIdx = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const lane = lanes[laneIdx];
      const conflict = lane && lane.some(([s, e]) => !(endCol < s || startCol > e));
      if (!conflict) {
        if (!lanes[laneIdx]) lanes[laneIdx] = [];
        lanes[laneIdx].push([startCol, endCol]);
        break;
      }
      laneIdx++;
    }

    bars.push({
      event,
      startCol,
      endCol,
      lane: laneIdx,
      clippedStart: rawStart < 0,
      clippedEnd: rawEnd > 6
    });
  }

  return bars;
}
