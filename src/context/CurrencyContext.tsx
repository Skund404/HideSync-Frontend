import { createContext, ReactNode, useContext, useState } from 'react';

interface CurrencyContextProps {
  locale: string;
  currency: string;
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
  formatCurrency: (value: number) => string;
}

// Create a props interface that requires children.
interface CurrencyProviderProps {
  children: ReactNode;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(
  undefined
);

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  // Set default values; you might later allow these to be configurable.
  const [locale, setLocale] = useState('en-US');
  const [currency, setCurrency] = useState('USD');

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);

  return (
    <CurrencyContext.Provider
      value={{ locale, currency, setLocale, setCurrency, formatCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
