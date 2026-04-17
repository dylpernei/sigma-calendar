import React from 'react';

function EventChip({ event, onClick, compact = false }) {
  return (
    <div
      className="rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 truncate w-full"
      style={{ backgroundColor: event.color, color: event.textColor || 'white' }}
      onClick={() => onClick && onClick()}
    >
      {event.title}
    </div>
  );
}

export default EventChip; 