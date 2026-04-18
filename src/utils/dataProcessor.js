import {
  getColumnName,
  validateRequiredColumns,
  parseDate,
  getEventColor,
  getEventTextColor,
  debugEventProcessing
} from './columnHelper';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';

/**
 * Process Sigma data into calendar events structure
 * @param {Object} sigmaData - Sigma data object with column arrays
 * @param {Object} config - Configuration object with column names
 * @param {Object} settings - Settings object
 * @param {Object} elementColumns - Column information from getElementColumns
 * @returns {Object} - { events, categories } or null if no valid data
 */
export function processCalendarData(sigmaData, config, settings, elementColumns) {
  if (!sigmaData || !config.title || !config.startDate || !elementColumns) {
    console.warn('Missing required data for calendar processing:', {
      hasSigmaData: !!sigmaData,
      hasTitle: !!config.title,
      hasStartDate: !!config.startDate,
      hasElementColumns: !!elementColumns
    });
    return null;
  }

  // Validate that all required columns exist
  const requiredColumns = [config.title, config.startDate];
  
  // Add optional columns to validation if they exist
  if (config.ID) requiredColumns.push(config.ID);
  if (config.endDate) requiredColumns.push(config.endDate);
  if (config.description) requiredColumns.push(config.description);
  if (config.category) requiredColumns.push(config.category);
  if (config.eventFields && Array.isArray(config.eventFields)) {
    requiredColumns.push(...config.eventFields);
  }
  
  const columnValidation = validateRequiredColumns(elementColumns, requiredColumns);
  if (!columnValidation.isValid) {
    console.warn('Missing required columns:', columnValidation.missingColumns);
    return null;
  }

  // Get column data using column keys
  const titleData = sigmaData[config.title] || [];
  const startDateData = sigmaData[config.startDate] || [];
  const endDateData = config.endDate ? (sigmaData[config.endDate] || []) : null;
  const descriptionData = config.description ? (sigmaData[config.description] || []) : null;
  const categoryData = config.category ? (sigmaData[config.category] || []) : null;
  const idData = config.ID ? (sigmaData[config.ID] || []) : null;

  if (titleData.length === 0 || startDateData.length === 0) {
    console.warn('No title or start date data found');
    return null;
  }

  // Process additional event fields
  const eventFieldsData = {};
  if (config.eventFields && Array.isArray(config.eventFields)) {
    config.eventFields.forEach(fieldKey => {
      if (sigmaData[fieldKey]) {
        eventFieldsData[fieldKey] = sigmaData[fieldKey];
      }
    });
  }

  // Create events
  const events = [];
  const categories = new Set();
  const dataLength = titleData.length;

  for (let i = 0; i < dataLength; i++) {
    const title = titleData[i];
    const startDateValue = startDateData[i];

    // Skip if no title or start date
    if (!title || !startDateValue) continue;

    // Parse start date
    const startDate = parseDate(startDateValue);
    if (!startDate) {
      console.warn(`Invalid start date at index ${i}:`, startDateValue);
      continue;
    }

    // Parse end date if provided, otherwise use start date
    let endDate = startDate;
    if (endDateData && endDateData[i]) {
      const parsedEndDate = parseDate(endDateData[i]);
      if (parsedEndDate) {
        endDate = parsedEndDate;
      }
    }

    // Get other fields
    const description = descriptionData && descriptionData[i] ? String(descriptionData[i]) : '';
    const category = categoryData && categoryData[i] ? String(categoryData[i]) : 'Default';
    const eventId = idData && idData[i] != null ? idData[i] : i;

    // Add category to set
    categories.add(category);

    // Extract additional event fields
    const additionalFields = {};
    if (config.eventFields && Array.isArray(config.eventFields)) {
      config.eventFields.forEach(fieldKey => {
        if (eventFieldsData[fieldKey] && eventFieldsData[fieldKey][i] != null) {
          const fieldName = getColumnName(elementColumns, fieldKey);
          additionalFields[fieldName] = String(eventFieldsData[fieldKey][i]);
        }
      });
    }

    // Determine if this is an all-day event
    const isAllDay = !hasTimeComponent(startDateValue) && !hasTimeComponent(endDateData?.[i]);

    // Create event object
    const event = {
      id: eventId,
      title: String(title),
      start: startDate,
      end: endDate,
      allDay: isAllDay,
      description,
      category,
      color: getEventColor(category, settings),
      textColor: getEventTextColor(category, settings),
      additionalFields,
      originalIndex: i
    };

    // Debug event processing in development
    if (process.env.NODE_ENV === 'development' && i < 3) {
      debugEventProcessing(event, config, elementColumns);
    }

    events.push(event);
  }

  // Sort events by start date
  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  console.log(`Processed ${events.length} events from ${dataLength} rows`);

  return {
    events,
    categories: Array.from(categories),
    stats: {
      totalEvents: events.length,
      totalRows: dataLength,
      dateRange: events.length > 0 ? {
        start: events[0].start,
        end: events[events.length - 1].end
      } : null
    }
  };
}

/**
 * Check if a date value has a time component
 * @param {any} dateValue - Date value to check
 * @returns {boolean} - True if has time component
 */
function hasTimeComponent(dateValue) {
  if (!dateValue) return false;
  
  const date = parseDate(dateValue);
  if (!date) return false;
  
  // Check if time is not midnight (00:00:00)
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

/**
 * Generate sample events for development/testing
 * @param {Date} startDate - Start date for sample events
 * @param {number} count - Number of events to generate
 * @returns {Object} - Calendar data with sample events
 */
export function generateSampleEvents(startDate = new Date(), count = 10) {
  const events = [];
  const categories = ['Meeting', 'Task', 'Deadline', 'Event', 'Review'];
  const colors = ['#3788d8', '#f97316', '#ef4444', '#22c55e', '#8b5cf6'];

  for (let i = 0; i < count; i++) {
    const eventStart = addDays(startDate, Math.floor(Math.random() * 30));
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    events.push({
      id: i + 1,
      title: `Sample Event ${i + 1}`,
      start: eventStart,
      end: Math.random() > 0.7 ? addDays(eventStart, Math.floor(Math.random() * 3) + 1) : eventStart,
      allDay: Math.random() > 0.5,
      description: `This is a sample event description for event ${i + 1}`,
      category,
      color: colors[categories.indexOf(category)],
      additionalFields: {
        'Priority': ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        'Assignee': ['John Doe', 'Jane Smith', 'Bob Johnson'][Math.floor(Math.random() * 3)]
      },
      originalIndex: i
    });
  }

  return {
    events: events.sort((a, b) => a.start.getTime() - b.start.getTime()),
    categories,
    stats: {
      totalEvents: events.length,
      totalRows: events.length,
      dateRange: {
        start: events[0].start,
        end: events[events.length - 1].end
      }
    }
  };
}

/**
 * Filter events by date range
 * @param {Array} events - Array of events
 * @param {Date} startDate - Start date of range
 * @param {Date} endDate - End date of range
 * @returns {Array} - Filtered events
 */
export function filterEventsByDateRange(events, startDate, endDate) {
  if (!events || !Array.isArray(events)) return [];
  
  return events.filter(event => {
    const eventStart = event.start;
    const eventEnd = event.end || event.start;
    
    // Event overlaps with the date range
    return eventStart <= endDate && eventEnd >= startDate;
  });
}

/**
 * Group events by date
 * @param {Array} events - Array of events
 * @returns {Object} - Events grouped by date string (YYYY-MM-DD)
 */
export function groupEventsByDate(events) {
  if (!events || !Array.isArray(events)) return {};
  
  const grouped = {};
  
  events.forEach(event => {
    const dateKey = format(event.start, 'yyyy-MM-dd');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });
  
  return grouped;
}

/**
 * Get events for a specific date
 * @param {Array} events - Array of events
 * @param {Date} date - Date to get events for
 * @returns {Array} - Events for the date
 */
export function getEventsForDate(events, date) {
  if (!events || !Array.isArray(events) || !date) return [];
  
  const targetDate = startOfDay(date);
  
  return events.filter(event => {
    const eventStart = startOfDay(event.start);
    const eventEnd = endOfDay(event.end || event.start);
    
    // Check if event spans this date
    return eventStart <= targetDate && eventEnd >= targetDate;
  });
}

/**
 * Validate calendar configuration
 * @param {Object} config - Configuration object
 * @returns {Object} - { isValid, errors }
 */
export function validateCalendarConfig(config) {
  const errors = [];

  if (!config.source) {
    errors.push('Data source is required');
  }

  if (!config.title) {
    errors.push('Event title column is required');
  }

  if (!config.startDate) {
    errors.push('Start date column is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 