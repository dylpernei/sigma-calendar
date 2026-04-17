import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import EventDetailModal, { EventPreviewModal } from './components/EventDetailModal';
import DayEventsModal from './components/DayEventsModal';
import { 
  MonthView, 
  WeekView, 
  DayView, 
  YearView 
} from './components/views';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Grid3X3, 
  Clock,
  Settings as SettingsIcon
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays,
  addYears,
  subYears,
  startOfWeek,
  endOfWeek
} from 'date-fns';

function CalendarView({ data, settings, onEventClick, editMode, onOpenSettings }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(settings.defaultView || 'month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);

  // Track which defaultStartDate setting was last applied (to detect setting changes)
  const appliedStartDateSetting = useRef(null);

  // Set initial date based on settings
  useEffect(() => {
    // Only apply if the setting changed or hasn't been applied yet
    if (settings.defaultStartDate === 'firstData' && 
        appliedStartDateSetting.current !== 'firstData' && 
        data?.stats?.dateRange?.start) {
      setCurrentDate(data.stats.dateRange.start);
      appliedStartDateSetting.current = 'firstData';
    } else if (settings.defaultStartDate === 'today' && 
               appliedStartDateSetting.current === null) {
      // Only apply 'today' on initial load, not when switching back from 'firstData'
      appliedStartDateSetting.current = 'today';
    } else if (settings.defaultStartDate === 'today' && 
               appliedStartDateSetting.current === 'firstData') {
      // User switched from 'firstData' to 'today' - mark as applied but don't navigate
      // (they can use the Today button if they want to go to today)
      appliedStartDateSetting.current = 'today';
    }
  }, [data?.stats?.dateRange?.start, settings.defaultStartDate]);

  // Responsive detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsVerySmall(window.innerWidth < 480);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Navigation functions
  const navigatePrevious = () => {
    switch (currentView) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(subYears(currentDate, 1));
        break;
      default:
        break;
    }
  };

  const navigateNext = () => {
    switch (currentView) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(addYears(currentDate, 1));
        break;
      default:
        break;
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Modal handling functions
  const handleEventModalOpen = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventPreviewOpen = (event) => {
    setSelectedEvent(event);
    setShowPreviewModal(true);
  };

  const handleDayEventsOpen = (date, events) => {
    setSelectedDate(date);
    setSelectedDateEvents(events);
    setShowDayEventsModal(true);
  };

  const handleEventAction = (eventId, date, event) => {
    if (onEventClick) {
      onEventClick(eventId, date, event);
    }
  };

  const handleDateClick = (date) => {
    if (onEventClick) {
      // Use empty string for no event to align with Sigma text variable expectations
      onEventClick('', format(date, 'yyyy-MM-dd'));
    }
  };

  // Get title based on current view and date
  const getTitle = () => {
    switch (currentView) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return '';
    }
  };

  // Render the appropriate view
  const renderView = () => {
    const commonProps = {
      currentDate,
      events: data.events,
      settings,
      onEventClick: handleEventAction,
      onEventModalOpen: handleEventModalOpen,
      onEventPreviewOpen: handleEventPreviewOpen,
      onDayEventsOpen: handleDayEventsOpen,
      onDateClick: handleDateClick,
      mini: isMobile
    };

    switch (currentView) {
      case 'month':
        return <MonthView {...commonProps} />;
      case 'week':
        return <WeekView {...commonProps} />;
      case 'day':
        return <DayView {...commonProps} />;
      case 'year':
        return <YearView {...commonProps} />;
      default:
        return <MonthView {...commonProps} />;
    }
  };

  if (!data || !data.events) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Calendar Data</h3>
          <p className="text-muted-foreground">Please check your data source configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with navigation and view controls */}
      <div className={`flex items-center justify-between p-4 border-b border-border ${isMobile ? 'px-2' : ''}`}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isVerySmall && (
            <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={navigateToday}>
              Today
            </Button>
          )}
        </div>

        {!isVerySmall ? (
          <h1 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>{getTitle()}</h1>
        ) : (
          <div className="flex-1"></div>
        )}

        <div className="flex items-center gap-2">
          <Select value={currentView} onValueChange={setCurrentView}>
            <SelectTrigger className={isMobile ? "w-24" : "w-32"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  {isMobile ? 'Mo' : 'Month'}
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {isMobile ? 'Wk' : 'Week'}
                </div>
              </SelectItem>
              <SelectItem value="day">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Day
                </div>
              </SelectItem>
              <SelectItem value="year">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {isMobile ? 'Yr' : 'Year'}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {editMode && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              {!isMobile && 'Settings'}
            </Button>
          )}
        </div>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>

      {/* Event Modals */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventAction={handleEventAction}
        settings={settings}
      />
      
      <EventPreviewModal
        event={selectedEvent}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onViewDetails={() => {
          setShowPreviewModal(false);
          setShowEventModal(true);
        }}
        onEventAction={handleEventAction}
      />
      
      <DayEventsModal
        date={selectedDate}
        events={selectedDateEvents}
        isOpen={showDayEventsModal}
        onClose={() => setShowDayEventsModal(false)}
        onEventClick={handleEventAction}
        settings={settings}
      />
    </div>
  );
}

export default CalendarView; 