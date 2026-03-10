import { ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

// табы
export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = ''
}: TabsProps) {
  return (
    <div className={className}>
      {variant === 'underline' ? (
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-cyber-accent/20 text-cyber-accent rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="tabs-pill">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`tab-pill ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-cyber-black/50 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// вертикальные табы
interface VerticalTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function VerticalTabs({
  tabs,
  activeTab,
  onChange,
  className = ''
}: VerticalTabsProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg
            text-left transition-all duration-200
            ${activeTab === tab.id
              ? 'bg-cyber-accent/10 text-cyber-accent border-l-2 border-cyber-accent'
              : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-gray/20'
            }
            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {tab.icon && <span className="text-lg">{tab.icon}</span>}
          <span className="flex-1 font-medium">{tab.label}</span>
          {tab.badge !== undefined && (
            <span className="px-2 py-0.5 text-xs bg-cyber-gray/30 rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// табы с контентом
interface TabPanel {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabbedContentProps {
  tabs: TabPanel[];
  defaultTab?: string;
  className?: string;
}

export function TabbedContent({
  tabs,
  defaultTab,
  className = ''
}: TabbedContentProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const activePanel = tabs.find(t => t.id === activeTab);

  return (
    <div className={className}>
      <Tabs
        tabs={tabs.map(t => ({ ...t, badge: undefined }))}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      <div className="mt-4 animate-fade-in" role="tabpanel" id={`panel-${activeTab}`}>
        {activePanel?.content}
      </div>
    </div>
  );
}
