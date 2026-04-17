/**
 * Get column name from column key using elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {string} columnKey - Column key to look up
 * @returns {string} - Human readable column name or the key if not found
 */
export function getColumnName(elementColumns, columnKey) {
  if (!elementColumns || !columnKey) {
    return columnKey || '';
  }
  
  // Check if the column exists in elementColumns
  if (elementColumns[columnKey] && elementColumns[columnKey].name) {
    return elementColumns[columnKey].name;
  }
  
  // If not found, return the key itself (fallback)
  return columnKey;
}

/**
 * Get column type from column key using elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {string} columnKey - Column key to look up
 * @returns {string} - Column type or 'unknown' if not found
 */
export function getColumnType(elementColumns, columnKey) {
  if (!elementColumns || !columnKey) {
    return 'unknown';
  }
  
  if (elementColumns[columnKey] && elementColumns[columnKey].columnType) {
    return elementColumns[columnKey].columnType;
  }
  
  return 'unknown';
}

/**
 * Validate that required columns exist in elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {Array} requiredColumns - Array of column keys that are required
 * @returns {Object} - { isValid: boolean, missingColumns: Array }
 */
export function validateRequiredColumns(elementColumns, requiredColumns) {
  if (!elementColumns || !requiredColumns) {
    return { isValid: false, missingColumns: requiredColumns || [] };
  }
  
  const missingColumns = requiredColumns.filter(columnKey => 
    !elementColumns[columnKey] || !elementColumns[columnKey].name
  );
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns
  };
}

/**
 * Debug helper for event processing
 * @param {Object} event - Event object being processed
 * @param {Object} config - Configuration object
 * @param {Object} elementColumns - Column information from getElementColumns
 */
export function debugEventProcessing(event, config, elementColumns) {
  console.log('Event Processing Debug:', {
    event,
    config,
    titleColumn: config.title ? getColumnName(elementColumns, config.title) : 'Not set',
    startDateColumn: config.startDate ? getColumnName(elementColumns, config.startDate) : 'Not set',
    endDateColumn: config.endDate ? getColumnName(elementColumns, config.endDate) : 'Not set',
    categoryColumn: config.category ? getColumnName(elementColumns, config.category) : 'Not set',
    elementColumns
  });
}

/**
 * Parse date value from various formats
 * @param {any} dateValue - Date value from Sigma data
 * @returns {Date|null} - Parsed date or null if invalid
 */
export function parseDate(dateValue) {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // If it's a string or number, try to parse it
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date || !(date instanceof Date)) return '';
  
  const options = {
    short: { month: 'short', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit' },
    datetime: { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  };
  
  return date.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Check if a date value is valid
 * @param {any} dateValue - Value to check
 * @returns {boolean} - True if valid date
 */
export function isValidDate(dateValue) {
  const date = parseDate(dateValue);
  return date !== null && !isNaN(date.getTime());
}

/**
 * Get event background color based on category.
 * customEventColors entries can be either a plain hex string (legacy) or
 * an object { background: string, text: string }.
 * @param {string} category - Event category
 * @param {Object} colorSettings - Color settings from configuration
 * @returns {string} - Background color value
 */
export function getEventColor(category, colorSettings = {}) {
  if (!category) return '#3788d8'; // Default blue

  // Check custom color mapping first
  if (colorSettings.customEventColors && colorSettings.customEventColors[category]) {
    const custom = colorSettings.customEventColors[category];
    if (typeof custom === 'object' && custom.background) return custom.background;
    if (typeof custom === 'string') return custom;
  }

  // Default color palette for categories
  const defaultColors = {
    'urgent': '#ef4444',      // red
    'high': '#f97316',        // orange
    'medium': '#eab308',      // yellow
    'low': '#22c55e',         // green
    'completed': '#22c55e',   // green
    'in progress': '#3b82f6', // blue
    'todo': '#6b7280',        // gray
    'cancelled': '#6b7280'    // gray
  };

  const categoryLower = category.toLowerCase();
  if (defaultColors[categoryLower]) {
    return defaultColors[categoryLower];
  }

  // Generate a consistent color based on category name
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Get event text (foreground) color based on category.
 * Returns the user-configured text color when set, otherwise 'white'.
 * @param {string} category - Event category
 * @param {Object} colorSettings - Color settings from configuration
 * @returns {string} - Text color value
 */
export function getEventTextColor(category, colorSettings = {}) {
  if (category && colorSettings.customEventColors && colorSettings.customEventColors[category]) {
    const custom = colorSettings.customEventColors[category];
    if (typeof custom === 'object' && custom.text) return custom.text;
  }
  return 'white';
} 