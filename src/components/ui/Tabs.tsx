'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be used within <Tabs>');
  return ctx;
}

/* ─── Tabs Root ─── */
interface TabsProps {
  defaultTab: string;
  onChange?: (tab: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultTab, onChange, children, className }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  const setActiveTab = useCallback(
    (id: string) => {
      setActiveTabState(id);
      onChange?.(id);
    },
    [onChange],
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ─── TabList ─── */
interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
    if (!tabs || tabs.length === 0) return;

    const currentIndex = Array.from(tabs).findIndex(
      (t) => t === document.activeElement,
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        'flex overflow-x-auto scrollbar-none border-b border-border gap-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Tab ─── */
interface TabProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Tab({ id, children, className }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(id)}
      className={cn(
        'shrink-0 px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px whitespace-nowrap',
        isActive
          ? 'text-accent border-accent'
          : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ─── TabPanel ─── */
interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={cn('py-4', className)}
    >
      {children}
    </div>
  );
}
