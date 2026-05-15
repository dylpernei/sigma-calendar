import React from 'react';

function EventChip({ event, onClick, compact = false, multiDay = false, clippedStart = false, clippedEnd = false }) {
  const radiusClass = multiDay
    ? `${clippedStart ? 'rounded-l-none' : 'rounded-l'} ${clippedEnd ? 'rounded-r-none' : 'rounded-r'}`
    : 'rounded';

  return (
    <div
      className={`${radiusClass} px-2 py-1 text-xs cursor-pointer hover:opacity-80 truncate w-full h-full leading-tight`}
      style={{ backgroundColor: event.color, color: event.textColor || 'white' }}
      onClick={() => onClick && onClick()}
    >
      {event.title}
    </div>
  );
}

export default EventChip;
