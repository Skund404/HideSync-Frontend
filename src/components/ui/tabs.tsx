// src/components/ui/tabs.tsx
import React, { ReactNode, useState } from 'react';

interface TabsProps {
  defaultValue?: string;
  children: ReactNode;
  className?: string;
  onValueChange?: (value: string) => void;
}

interface TabContextType {
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

const TabContext = React.createContext<TabContextType>({});

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  children,
  className,
  onValueChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabContext.Provider>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  const { activeTab } = React.useContext(TabContext);

  if (value !== activeTab) return null;

  return <div className={`m-0 ${className}`}>{children}</div>;
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => (
  <div className={`bg-stone-100 inline-flex space-x-1 ${className}`}>
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
}) => {
  const { activeTab, onTabChange } = React.useContext(TabContext);

  return (
    <button
      className={`
        px-4 py-2 
        text-sm 
        flex items-center
        ${
          activeTab === value
            ? 'bg-white text-stone-900 data-[state=active]:bg-white'
            : 'text-stone-600 hover:bg-stone-200'
        }
        ${className}
      `}
      onClick={() => onTabChange?.(value)}
      data-state={activeTab === value ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};
