/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { client, useConfig, useElementData, useElementColumns, useActionTrigger } from '@sigmacomputing/plugin';
import Settings, { DEFAULT_SETTINGS } from './Settings';
import HelpModal from './HelpModal';
import Onboarding from './components/Onboarding';
import { processCalendarData } from './utils/dataProcessor';
import { formatColumnValue } from './utils/columnHelper';
import CalendarView from './CalendarView';
import './App.css';

const MAX_ADDITIONAL_VARS = 15;

// Static panel registration — never re-called at runtime so Sigma never resets
// variable connections. Slot names are stable; labels are generic numbers.
client.config.configureEditorPanel([
  { name: 'source',       type: 'element' },
  { name: 'ID',           type: 'column', source: 'source', allowMultiple: false, label: 'ID Column' },
  { name: 'title',        type: 'column', source: 'source', allowMultiple: false, label: 'Event Title' },
  { name: 'startDate',    type: 'column', source: 'source', allowMultiple: false, label: 'Start Date' },
  { name: 'endDate',      type: 'column', source: 'source', allowMultiple: false, label: 'End Date (Optional)' },
  { name: 'description',  type: 'column', source: 'source', allowMultiple: false, label: 'Description (Optional)' },
  { name: 'category',     type: 'column', source: 'source', allowMultiple: false, label: 'Category/Color (Optional)' },
  { name: 'eventFields',  type: 'column', source: 'source', allowMultiple: true,  label: 'Additional Fields' },
  { name: 'selectedEventID',     type: 'variable', label: 'Selected Event ID' },
  { name: 'selectedDate',        type: 'variable', label: 'Selected Start Date' },
  { name: 'selectedTitle',       type: 'variable', label: 'Selected Title' },
  { name: 'selectedCategory',    type: 'variable', label: 'Selected Category' },
  { name: 'selectedEndDate',     type: 'variable', label: 'Selected End Date' },
  { name: 'selectedDescription', type: 'variable', label: 'Selected Description' },
  { name: 'additionalVar0',  type: 'variable', label: 'Additional Field 1' },
  { name: 'additionalVar1',  type: 'variable', label: 'Additional Field 2' },
  { name: 'additionalVar2',  type: 'variable', label: 'Additional Field 3' },
  { name: 'additionalVar3',  type: 'variable', label: 'Additional Field 4' },
  { name: 'additionalVar4',  type: 'variable', label: 'Additional Field 5' },
  { name: 'additionalVar5',  type: 'variable', label: 'Additional Field 6' },
  { name: 'additionalVar6',  type: 'variable', label: 'Additional Field 7' },
  { name: 'additionalVar7',  type: 'variable', label: 'Additional Field 8' },
  { name: 'additionalVar8',  type: 'variable', label: 'Additional Field 9' },
  { name: 'additionalVar9',  type: 'variable', label: 'Additional Field 10' },
  { name: 'additionalVar10', type: 'variable', label: 'Additional Field 11' },
  { name: 'additionalVar11', type: 'variable', label: 'Additional Field 12' },
  { name: 'additionalVar12', type: 'variable', label: 'Additional Field 13' },
  { name: 'additionalVar13', type: 'variable', label: 'Additional Field 14' },
  { name: 'additionalVar14', type: 'variable', label: 'Additional Field 15' },
  { name: 'config',       type: 'text',           label: 'Settings Config (JSON)', defaultValue: '{}' },
  { name: 'editMode',     type: 'toggle',          label: 'Edit Mode' },
  { name: 'onEventClick', type: 'action-trigger',  label: 'Event Click Action' },
]);

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const elementColumns = useElementColumns(config.source);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // useVariable must never receive null/undefined — pass '' for unlinked slots
  // so Sigma gets a valid no-op binding. The != null guards in handleEventClick
  // ensure we only call setters for slots actually linked to a control.
  // All variables written directly via client.config.setVariable in handleEventClick.
  // No useVariable hooks needed — this avoids binding-at-render issues where hooks
  // bound to '' on first render would silently fail when config arrived later.

  const triggerEventClick = useActionTrigger(config.onEventClick);

  // Track when settings were saved locally to avoid race condition with stale config.config updates
  const lastSettingsSaveTime = useRef(0);

  // Function to apply theme colors to CSS custom properties
  const applyThemeColors = (theme, customColors = null) => {
    // Import preset themes from Settings
    const PRESET_THEMES = {
      light: {
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

    const colors = customColors || (PRESET_THEMES[theme]?.colors || PRESET_THEMES.light.colors);
    
    Object.entries(colors).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  };

  // Parse config JSON and load settings
  useEffect(() => {
    // Skip config.config updates for 1 second after a local save
    // This handles multiple rapid updates from Sigma that might contain stale data
    const timeSinceLastSave = Date.now() - lastSettingsSaveTime.current;
    if (timeSinceLastSave < 1000) {
      return;
    }
    
    if (config.config && config.config.trim()) {
      try {
        const parsedConfig = JSON.parse(config.config);
        const newSettings = { ...DEFAULT_SETTINGS, ...parsedConfig };
        setSettings(newSettings);
      } catch (err) {
        console.error('Invalid config JSON:', err);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [config.config]);

  // Apply theme on settings change
  useEffect(() => {
    if (settings.styling?.enableDynamicTheming !== false) {
      if (settings.styling?.theme === 'custom') {
        applyThemeColors('custom', settings.styling.customColors);
      } else if (settings.styling?.theme) {
        applyThemeColors(settings.styling.theme);
      }
    }
  }, [settings.styling]);

  // Process calendar data — memoized so it only reruns when source data actually changes
  const calendarData = useMemo(
    () => processCalendarData(sigmaData, config, settings, elementColumns),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sigmaData, elementColumns, config.source, config.title, config.startDate, config.endDate, config.description, config.category, config.eventFields, config.ID, settings]
  );

  const handleSettingsSave = (newSettings) => {
    // Record save time to prevent config.config useEffect from overwriting with stale data
    lastSettingsSaveTime.current = Date.now();
    setSettings(newSettings);
    setShowSettings(false);
  };

  const handleEventClick = async (eventId, date, event) => {
    try {
      const hasEvent = eventId != null && eventId !== '';

      const formatDate = (d) => {
        if (!d) return '';
        if (d instanceof Date) return d.toISOString().split('T')[0];
        return String(d);
      };

      // Helper: only write if varRef is a real linked variable. Catches SDK errors
      // (e.g. stale/invalid refs) so one bad slot can't block the rest.
      const trySetVariable = (varRef, value) => {
        if (varRef == null) return;
        try {
          client.config.setVariable(varRef, value);
        } catch (e) {
          console.warn(`setVariable failed for ref "${varRef}":`, e.message);
        }
      };

      trySetVariable(config.selectedEventID,     hasEvent ? String(eventId) : '');
      trySetVariable(config.selectedDate,        date);
      trySetVariable(config.selectedTitle,       hasEvent ? (event?.title ?? '') : '');
      trySetVariable(config.selectedCategory,    hasEvent ? (event?.category ?? '') : '');
      trySetVariable(config.selectedEndDate,     hasEvent ? formatDate(event?.end) : '');
      trySetVariable(config.selectedDescription, hasEvent ? (event?.description ?? '') : '');

      const fieldIds = Array.isArray(config.eventFields)
        ? config.eventFields
        : (config.eventFields ? [config.eventFields] : []);

      fieldIds.slice(0, MAX_ADDITIONAL_VARS).forEach((fieldId, i) => {
        const varRef = config[`additionalVar${i}`];
        if (varRef == null) return;
        const rawValue = hasEvent && event?.originalIndex != null
          ? sigmaData?.[fieldId]?.[event.originalIndex]
          : null;
        const columnType = elementColumns?.[fieldId]?.columnType;
        trySetVariable(varRef, rawValue != null ? formatColumnValue(rawValue, columnType) : '');
      });

      if (triggerEventClick && hasEvent) {
        triggerEventClick();
      }

      console.log('Variables set and action triggered:', { eventId, date });
    } catch (error) {
      console.error('Error handling event click:', error);
      setError(`Failed to handle event click: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-10">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!config.source || !config.title || !config.startDate) {
    return (
      <>
        <Onboarding
          hasSource={!!config.source}
          hasRequiredColumns={!!config.title && !!config.startDate}
          editMode={!!config.editMode}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHelp={() => setShowHelp(true)}
        />
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentSettings={settings}
          onSave={handleSettingsSave}
          client={client}
          elementColumns={elementColumns}
          config={config}
          categories={calendarData?.categories || []}
        />
      </>
    );
  }

  // If config exists but data is still loading, render nothing per requirements
  if (sigmaData == null) {
    return null;
  }
  // If data loaded but couldn't be processed, show a gentle configuration hint
  if (!calendarData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-10">
        <div className="text-center max-w-xl">
          <h3 className="text-lg font-semibold mb-2">Calendar Configuration</h3>
          <p className="text-muted-foreground">We couldn't build events from the current configuration. Please verify your selected columns match the source data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CalendarView 
        data={calendarData}
        settings={settings}
        onEventClick={handleEventClick}
        editMode={config.editMode}
        onOpenSettings={() => setShowSettings(true)}
      />
      
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={settings}
        onSave={handleSettingsSave}
        client={client}
        elementColumns={elementColumns}
        config={config}
      />
    </div>
  );
}

export default App; 