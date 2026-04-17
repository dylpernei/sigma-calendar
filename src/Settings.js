import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';

import { HelpCircle, Palette, RotateCcw } from 'lucide-react';
import HelpModal from './HelpModal';
import { HslaColorPicker, HexColorPicker } from 'react-colorful';

// Preset themes
const PRESET_THEMES = {
  light: {
    name: 'Light',
    colors: {
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 10% 3.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 3.9%',
      '--primary': '240 9% 9%',
      '--primary-foreground': '0 0% 98%',
      '--secondary': '240 4.8% 95.9%',
      '--secondary-foreground': '240 5.9% 10%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 5.9% 90%',
      '--input': '240 5.9% 90%',
      '--ring': '240 5% 64.9%',
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      '--background': '240 10% 3.9%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 3.9%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 3.9%',
      '--popover-foreground': '0 0% 98%',
      '--primary': '0 0% 98%',
      '--primary-foreground': '240 9% 9%',
      '--secondary': '240 3.7% 15.9%',
      '--secondary-foreground': '0 0% 98%',
      '--muted': '240 3.7% 15.9%',
      '--muted-foreground': '240 5% 64.9%',
      '--accent': '240 3.7% 15.9%',
      '--accent-foreground': '0 0% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 3.7% 15.9%',
      '--input': '240 3.7% 15.9%',
      '--ring': '240 4.9% 83.9%',
    }
  },
  blue: {
    name: 'Ocean Blue',
    colors: {
      '--background': '210 40% 98%',
      '--foreground': '222.2 84% 4.9%',
      '--card': '210 40% 98%',
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': '210 40% 98%',
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': '221.2 83.2% 53.3%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96%',
      '--secondary-foreground': '222.2 84% 4.9%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': '210 40% 96%',
      '--accent-foreground': '222.2 84% 4.9%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '221.2 83.2% 53.3%',
    }
  },
  green: {
    name: 'Forest Green',
    colors: {
      '--background': '140 40% 98%',
      '--foreground': '140 10% 4.9%',
      '--card': '140 40% 98%',
      '--card-foreground': '140 10% 4.9%',
      '--popover': '140 40% 98%',
      '--popover-foreground': '140 10% 4.9%',
      '--primary': '142.1 76.2% 36.3%',
      '--primary-foreground': '355.7 100% 97.3%',
      '--secondary': '140 40% 96%',
      '--secondary-foreground': '140 10% 4.9%',
      '--muted': '140 40% 96%',
      '--muted-foreground': '140 5% 46.9%',
      '--accent': '140 40% 96%',
      '--accent-foreground': '140 10% 4.9%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '140 40% 98%',
      '--border': '140 30% 91.4%',
      '--input': '140 30% 91.4%',
      '--ring': '142.1 76.2% 36.3%',
    }
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      '--background': '270 40% 98%',
      '--foreground': '270 10% 4.9%',
      '--card': '270 40% 98%',
      '--card-foreground': '270 10% 4.9%',
      '--popover': '270 40% 98%',
      '--popover-foreground': '270 10% 4.9%',
      '--primary': '262.1 83.3% 57.8%',
      '--primary-foreground': '270 40% 98%',
      '--secondary': '270 40% 96%',
      '--secondary-foreground': '270 10% 4.9%',
      '--muted': '270 40% 96%',
      '--muted-foreground': '270 5% 46.9%',
      '--accent': '270 40% 96%',
      '--accent-foreground': '270 10% 4.9%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '270 40% 98%',
      '--border': '270 30% 91.4%',
      '--input': '270 30% 91.4%',
      '--ring': '262.1 83.3% 57.8%',
    }
  }
};

// Default settings for calendar
export const DEFAULT_SETTINGS = {
  defaultView: 'month', // 'month', 'week', 'year', 'day'
  defaultStartDate: 'today', // 'today' or 'firstData'
  weekStartsOn: 0, // 0 = Sunday, 1 = Monday
  timeFormat: '12h', // '12h', '24h'
  showWeekNumbers: false,
  showWeekends: true,
  eventDisplay: 'block', // 'block', 'list-item', 'background', 'inverse-background'
  eventHeight: 'auto', // 'auto', 'fixed'
  eventTimeFormat: 'short', // 'short', 'long', 'none'
  firstDay: 0, // 0 = Sunday, 1 = Monday
  dayMaxEvents: 3, // Maximum events to show per day before showing "more" link
  dayMaxEventRows: 3, // Maximum rows of events in month view
  slotDuration: '00:30:00', // Duration of time slots in agenda views
  scrollTime: '06:00:00', // Time to scroll to initially
  allDaySlot: true, // Show all-day slot in agenda views
  businessHours: {
    start: '09:00',
    end: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
  },
  eventColorByCategory: true, // Use category column for event colors
  customEventColors: {}, // Custom color mapping for categories
  showEventTooltips: true,
  enableEventClick: true,
  eventInteractionMode: 'auto', // 'auto', 'tooltip', 'modal', 'both'
  showDateTooltips: true,
  tooltipDelay: 300,
  showEventIds: false,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  viewSpecificSettings: {
    month: {
      fixedWeekCount: false,
      showNonCurrentDates: true
    },
    week: {
      dayHeaders: true,
      slotMinTime: '00:00:00',
      slotMaxTime: '24:00:00'
    },
    day: {
      dayHeaders: true,
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00'
    }
  },
  // New styling settings
  styling: {
    theme: 'light', // 'light', 'dark', 'blue', 'green', 'purple', 'custom'
    customColors: PRESET_THEMES.light.colors, // Custom color overrides
    enableDynamicTheming: true,
  }
};

// Function to apply theme colors to CSS custom properties
const applyThemeColors = (theme, customColors = null) => {
  const colors = customColors || (PRESET_THEMES[theme]?.colors || PRESET_THEMES.light.colors);
  
  Object.entries(colors).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
};

// HSLA helpers for storage as CSS var-friendly strings: "h s% l% / a"
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const parseHslaString = (value) => {
  if (!value) return { h: 0, s: 0, l: 50, a: 1 };
  // Expected forms: "h s% l%" or "h s% l% / a"
  const [hslPart, alphaPart] = value.split('/').map((v) => v.trim());
  const [hStr, sStr, lStr] = hslPart.split(' ').map((v) => v.trim());
  const h = Number.parseFloat(hStr || '0');
  const s = Number.parseFloat((sStr || '0').replace('%', ''));
  const l = Number.parseFloat((lStr || '50').replace('%', ''));
  const a = alphaPart !== undefined ? Number.parseFloat(alphaPart) : 1;
  return {
    h: clamp(Number.isFinite(h) ? h : 0, 0, 360),
    s: clamp(Number.isFinite(s) ? s : 0, 0, 100),
    l: clamp(Number.isFinite(l) ? l : 50, 0, 100),
    a: clamp(Number.isFinite(a) ? a : 1, 0, 1),
  };
};
const formatHslaString = ({ h, s, l, a }) => `${Math.round(clamp(h ?? 0, 0, 360))} ${Math.round(clamp(s ?? 0, 0, 100))}% ${Math.round(clamp(l ?? 50, 0, 100))}% / ${clamp(a ?? 1, 0, 1)}`;

function ColorPickerField({ label, colorKey, value, onChange }) {
  const [open, setOpen] = useState(false);
  const hsla = parseHslaString(value);
  const swatchStyle = {
    backgroundColor: `hsl(${formatHslaString(hsla)})`,
  };
  const checkerBg = {
    backgroundImage:
      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  };
  return (
    <div className="flex items-center gap-2 relative">
      <label className="text-xs font-normal min-w-0 flex-1">{label}</label>
      <button
        type="button"
        className="w-8 h-8 rounded border border-border overflow-hidden"
        style={checkerBg}
        aria-label={`Pick ${label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-full h-full" style={swatchStyle} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 bg-popover text-popover-foreground border border-border rounded-md p-2 shadow-md">
          <div className="space-y-2">
            <HslaColorPicker
              color={hsla}
              onChange={(c) => onChange(colorKey, formatHslaString(c))}
            />
            <div className="text-xs text-muted-foreground">
              {formatHslaString(hsla)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hex color picker for event category colors
function CategoryColorField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const checkerBg = {
    backgroundImage:
      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  };
  return (
    <div className="flex items-center gap-2 relative">
      <label className="text-xs font-normal min-w-0 flex-1">{label}</label>
      <button
        type="button"
        className="w-7 h-7 rounded border border-border overflow-hidden flex-shrink-0"
        style={checkerBg}
        aria-label={`Pick ${label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-full h-full" style={{ backgroundColor: value || '#888' }} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-popover text-popover-foreground border border-border rounded-md p-2 shadow-md">
          <HexColorPicker color={value || '#888888'} onChange={onChange} />
          <div className="text-xs text-muted-foreground mt-1">{value || '#888888'}</div>
        </div>
      )}
    </div>
  );
}

function Settings({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  client,
  elementColumns = {},
  config = {},
  categories = []
}) {
  const [tempSettings, setTempSettings] = useState(currentSettings);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Update temp settings when current settings change
  useEffect(() => {
    // Ensure all required properties exist with defaults
    const settingsWithDefaults = {
      ...DEFAULT_SETTINGS,
      ...currentSettings
    };
    setTempSettings(settingsWithDefaults);
  }, [currentSettings]);

  // Apply theme changes dynamically when enabled
  useEffect(() => {
    if (tempSettings.styling?.enableDynamicTheming && isOpen) {
      if (tempSettings.styling.theme === 'custom') {
        applyThemeColors('custom', tempSettings.styling.customColors);
      } else {
        applyThemeColors(tempSettings.styling.theme);
      }
    }
  }, [tempSettings.styling, isOpen]);

  const handleSave = () => {
    const configJson = JSON.stringify(tempSettings, null, 2);
    
    try {
      client.config.set({ config: configJson });
      onSave(tempSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCancel = () => {
    setTempSettings(currentSettings);
    // Reset theme if dynamic theming was enabled
    if (currentSettings.styling?.enableDynamicTheming) {
      if (currentSettings.styling.theme === 'custom') {
        applyThemeColors('custom', currentSettings.styling.customColors);
      } else {
        applyThemeColors(currentSettings.styling.theme);
      }
    }
    onClose();
  };

  const handleThemeChange = (theme) => {
    const newStyling = { ...tempSettings.styling, theme };
    
    // If switching to a preset theme, update custom colors
    if (theme !== 'custom' && PRESET_THEMES[theme]) {
      newStyling.customColors = { ...PRESET_THEMES[theme].colors };
    }
    
    setTempSettings({ ...tempSettings, styling: newStyling });
  };

  const handleCustomColorChange = (colorKey, hslaString) => {
    const newCustomColors = { ...tempSettings.styling.customColors, [colorKey]: hslaString };
    
    setTempSettings({
      ...tempSettings,
      styling: { ...tempSettings.styling, customColors: newCustomColors }
    });
  };

  const handleCategoryColorChange = (category, colorType, hexValue) => {
    const existing = tempSettings.customEventColors?.[category];
    const current = (typeof existing === 'object' && existing !== null) ? existing : {};
    const updated = { ...current, [colorType]: hexValue };
    setTempSettings({
      ...tempSettings,
      customEventColors: { ...tempSettings.customEventColors, [category]: updated }
    });
  };

  const resetToDefaultTheme = () => {
    setTempSettings({
      ...tempSettings,
      styling: {
        theme: 'light',
        customColors: { ...PRESET_THEMES.light.colors },
        enableDynamicTheming: true
      }
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>Calendar Settings</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
            </div>
          </DialogHeader>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-border">
            <Button
              variant={activeTab === 'general' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('general')}
              className="rounded-b-none"
            >
              General
            </Button>
            <Button
              variant={activeTab === 'styling' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('styling')}
              className="rounded-b-none gap-2"
            >
              <Palette className="h-4 w-4" />
              Styling
            </Button>
          </div>

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="defaultView">Default View</Label>
              <Select
                value={tempSettings.defaultView}
                onValueChange={(value) => setTempSettings({ ...tempSettings, defaultView: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="year">Year View</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose the initial calendar view</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultStartDate">Initial Calendar Date</Label>
              <Select
                value={tempSettings.defaultStartDate || 'today'}
                onValueChange={(value) => setTempSettings({ ...tempSettings, defaultStartDate: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select initial date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="firstData">First month with data</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Which date the calendar opens to initially</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekStartsOn">Week Starts On</Label>
              <Select
                value={tempSettings.weekStartsOn.toString()}
                onValueChange={(value) => setTempSettings({ ...tempSettings, weekStartsOn: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select first day of week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">First day of the week</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={tempSettings.timeFormat}
                onValueChange={(value) => setTempSettings({ ...tempSettings, timeFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Time display format</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDisplay">Event Display Style</Label>
              <Select
                value={tempSettings.eventDisplay}
                onValueChange={(value) => setTempSettings({ ...tempSettings, eventDisplay: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event display style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block (Default)</SelectItem>
                  <SelectItem value="list-item">List Item</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                  <SelectItem value="inverse-background">Inverse Background</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How events are displayed on the calendar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayMaxEvents">Max Events Per Day</Label>
              <Select
                value={tempSettings.dayMaxEvents.toString()}
                onValueChange={(value) => setTempSettings({ ...tempSettings, dayMaxEvents: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Events</SelectItem>
                  <SelectItem value="3">3 Events</SelectItem>
                  <SelectItem value="4">4 Events</SelectItem>
                  <SelectItem value="5">5 Events</SelectItem>
                  <SelectItem value="0">No Limit</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Maximum events shown per day before "more" link</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showWeekNumbers">Show Week Numbers</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showWeekNumbers"
                  checked={tempSettings.showWeekNumbers}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, showWeekNumbers: checked })}
                />
                <Label htmlFor="showWeekNumbers" className="text-sm font-normal">
                  {tempSettings.showWeekNumbers ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Display week numbers in the calendar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showWeekends">Show Weekends</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showWeekends"
                  checked={tempSettings.showWeekends}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, showWeekends: checked })}
                />
                <Label htmlFor="showWeekends" className="text-sm font-normal">
                  {tempSettings.showWeekends ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Include weekends in the calendar view</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventColorByCategory">Color by Category</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="eventColorByCategory"
                  checked={tempSettings.eventColorByCategory}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, eventColorByCategory: checked })}
                />
                <Label htmlFor="eventColorByCategory" className="text-sm font-normal">
                  {tempSettings.eventColorByCategory ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Use category column to color-code events</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showEventTooltips">Event Tooltips</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showEventTooltips"
                  checked={tempSettings.showEventTooltips}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, showEventTooltips: checked })}
                />
                <Label htmlFor="showEventTooltips" className="text-sm font-normal">
                  {tempSettings.showEventTooltips ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Show detailed information when hovering over events</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enableEventClick">Event Click Actions</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableEventClick"
                  checked={tempSettings.enableEventClick}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, enableEventClick: checked })}
                />
                <Label htmlFor="enableEventClick" className="text-sm font-normal">
                  {tempSettings.enableEventClick ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Enable clicking on events to trigger actions</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventInteractionMode">Event Interaction Mode</Label>
              <Select
                value={tempSettings.eventInteractionMode}
                onValueChange={(value) => setTempSettings({ ...tempSettings, eventInteractionMode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interaction mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (view-specific)</SelectItem>
                  <SelectItem value="tooltip">Tooltips Only</SelectItem>
                  <SelectItem value="modal">Modals Only</SelectItem>
                  <SelectItem value="both">Both Tooltips & Modals</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How event details are displayed when interacting</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showDateTooltips">Date Tooltips</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showDateTooltips"
                  checked={tempSettings.showDateTooltips}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, showDateTooltips: checked })}
                />
                <Label htmlFor="showDateTooltips" className="text-sm font-normal">
                  {tempSettings.showDateTooltips ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Show tooltips when hovering over dates</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tooltipDelay">Tooltip Delay (ms)</Label>
              <Select
                value={tempSettings.tooltipDelay.toString()}
                onValueChange={(value) => setTempSettings({ ...tempSettings, tooltipDelay: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tooltip delay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Instant</SelectItem>
                  <SelectItem value="150">Fast (150ms)</SelectItem>
                  <SelectItem value="300">Normal (300ms)</SelectItem>
                  <SelectItem value="500">Slow (500ms)</SelectItem>
                  <SelectItem value="750">Very Slow (750ms)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Delay before showing tooltips</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showEventIds">Show Event IDs</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showEventIds"
                  checked={tempSettings.showEventIds}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, showEventIds: checked })}
                />
                <Label htmlFor="showEventIds" className="text-sm font-normal">
                  {tempSettings.showEventIds ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Display event IDs in detailed views (for debugging)</p>
            </div>
          </div>
          )}

          {/* Styling Settings Tab */}
          {activeTab === 'styling' && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="stylingTheme">Theme</Label>
                <Select
                  value={tempSettings.styling?.theme || 'light'}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="blue">Ocean Blue</SelectItem>
                    <SelectItem value="green">Forest Green</SelectItem>
                    <SelectItem value="purple">Royal Purple</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose a pre-defined theme or customize colors</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enableDynamicTheming">Enable Dynamic Theming</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableDynamicTheming"
                    checked={tempSettings.styling?.enableDynamicTheming || false}
                    onCheckedChange={(checked) => setTempSettings({ 
                      ...tempSettings, 
                      styling: { ...tempSettings.styling, enableDynamicTheming: checked } 
                    })}
                  />
                  <Label htmlFor="enableDynamicTheming" className="text-sm font-normal">
                    {tempSettings.styling?.enableDynamicTheming ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">Apply theme changes in real-time while editing</p>
              </div>

              {tempSettings.styling?.theme === 'custom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customColors">Custom Colors</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToDefaultTheme}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Primary Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Primary Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--primary', '--primary-foreground', '--secondary', '--secondary-foreground'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ')}:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Background Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Background Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--background', '--foreground', '--card', '--card-foreground'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ')}:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Accent Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Accent Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--accent', '--accent-foreground', '--muted', '--muted-foreground'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ')}:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Border Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Border & Input Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--border', '--input', '--ring', '--destructive'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ') }:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    Click on any color square to customize. Changes apply instantly when dynamic theming is enabled.
                  </p>
                </div>
              )}

              {/* Category Colors */}
              {categories.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Category Colors</Label>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline"
                      onClick={() => setTempSettings({ ...tempSettings, customEventColors: {} })}
                    >
                      Reset all
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set background and text colors for each category.
                  </p>
                  <div className="space-y-3">
                    {categories.map((cat) => {
                      const entry = tempSettings.customEventColors?.[cat];
                      const bgColor = (typeof entry === 'object' && entry?.background) ? entry.background
                        : (typeof entry === 'string' ? entry : '');
                      const textColor = (typeof entry === 'object' && entry?.text) ? entry.text : '';
                      return (
                        <div key={cat} className="border border-border rounded-md p-3 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: bgColor || '#3788d8',
                                color: textColor || 'white'
                              }}
                            >
                              {cat}
                            </span>
                          </div>
                          <CategoryColorField
                            label="Background"
                            value={bgColor || '#3788d8'}
                            onChange={(hex) => handleCategoryColorChange(cat, 'background', hex)}
                          />
                          <CategoryColorField
                            label="Text"
                            value={textColor || '#ffffff'}
                            onChange={(hex) => handleCategoryColorChange(cat, 'text', hex)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Theme Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary"></div>
                      <span className="text-sm text-card-foreground">Primary Color</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-secondary"></div>
                      <span className="text-sm text-card-foreground">Secondary Color</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-accent"></div>
                      <span className="text-sm text-card-foreground">Accent Color</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Preview of current theme colors</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </>
  );
}

export default Settings; 