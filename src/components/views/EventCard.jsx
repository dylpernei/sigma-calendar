import React from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/button';

function EventCard({ event, onClick, onSecondaryClick }) {
  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onClick && onClick()}
        >
          <h3 className="font-semibold text-lg">{event.title}</h3>
          {event.description && (
            <p className="text-muted-foreground mt-1">{event.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>
              {event.allDay 
                ? 'All day' 
                : `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`
              }
            </span>
            {event.category && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: event.color, color: event.textColor || 'white' }}>
                {event.category}
              </span>
            )}
          </div>
          
          {/* Additional fields */}
          {Object.keys(event.additionalFields || {}).length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Object.entries(event.additionalFields).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-muted-foreground">{key}:</span>
                  <span className="ml-1">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        {onSecondaryClick && (
          <div className="ml-4 flex flex-col gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onSecondaryClick();
              }}
            >
              Select
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCard; 