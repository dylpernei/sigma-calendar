import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { format, isSameDay } from 'date-fns';
import { Calendar, Clock, Tag, Info } from 'lucide-react';

const EventDetailModal = ({ 
  event, 
  isOpen, 
  onClose, 
  onEventAction,
  settings = {}
}) => {
  if (!event) return null;

  const formatEventTime = (event) => {
    if (event.allDay) {
      if (isSameDay(event.start, event.end)) {
        return `All day on ${format(event.start, 'EEEE, MMMM d, yyyy')}`;
      } else {
        return `All day from ${format(event.start, 'MMM d')} to ${format(event.end, 'MMM d, yyyy')}`;
      }
    }
    
    const timeFormat = settings.timeFormat === '24h' ? 'HH:mm' : 'h:mm a';
    
    if (isSameDay(event.start, event.end)) {
      return `${format(event.start, `EEEE, MMMM d, yyyy 'at' ${timeFormat}`)} - ${format(event.end, timeFormat)}`;
    } else {
      return `${format(event.start, `MMM d, yyyy 'at' ${timeFormat}`)} - ${format(event.end, `MMM d, yyyy 'at' ${timeFormat}`)}`;
    }
  };

  const getDuration = (start, end) => {
    if (event.allDay) {
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days === 1 ? '1 day' : `${days} days`;
    }
    
    const duration = Math.round((end - start) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-xl font-semibold text-left break-words">
                {event.title}
              </DialogTitle>
              {event.category && (
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: event.color }}
                  />
                  <span className="text-sm text-muted-foreground">{event.category}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Time Information */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">When</div>
                <div className="text-sm">{formatEventTime(event)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Duration: {getDuration(event.start, event.end)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <div className="font-medium text-sm text-muted-foreground">Description</div>
              </div>
              <div className="pl-7 text-sm whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}

          {/* Additional Fields */}
          {event.additionalFields && Object.keys(event.additionalFields).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div className="font-medium text-sm text-muted-foreground">Additional Information</div>
              </div>
              <div className="pl-7 space-y-2">
                {Object.entries(event.additionalFields).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start gap-4">
                    <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">
                      {key}:
                    </span>
                    <span className="text-sm text-right break-words">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event ID (for debugging/reference) */}
          {settings.showEventIds && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <div className="font-medium text-sm text-muted-foreground">Event ID</div>
              </div>
              <div className="pl-7 text-xs text-muted-foreground font-mono">
                {event.id}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEventAction && (
            <Button 
              onClick={() => {
                onEventAction(event.id, format(event.start, 'yyyy-MM-dd'), event);
                onClose();
              }}
            >
              Select Event
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Quick Event Preview Modal (lighter version)
const EventPreviewModal = ({ 
  event, 
  isOpen, 
  onClose, 
  onViewDetails,
  onEventAction 
}) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {event.allDay ? 'All day' : `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
          </div>
          
          {event.description && (
            <div className="text-sm" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {event.description}
            </div>
          )}
          
          {event.category && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: event.color }}
              />
              <span className="text-sm text-muted-foreground">{event.category}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails}>
              View Details
            </Button>
          )}
          {onEventAction && (
            <Button onClick={() => {
              onEventAction(event.id, format(event.start, 'yyyy-MM-dd'), event);
              onClose();
            }}>
              Select Event
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
export { EventPreviewModal }; 