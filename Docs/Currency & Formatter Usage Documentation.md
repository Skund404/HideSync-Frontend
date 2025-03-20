Below is an example of documentation you could add (or reference in your project’s README) to explain how to use the centralized currency configuration and formatter utilities in your financial components and elsewhere in the application.

---

# Currency & Formatter Usage Documentation

This document explains how to use the centralized currency configuration and formatting utilities in your application—in particular within financial components.

## 1. Global Configuration

A configuration file is used to define your application’s default locale and currency. For example, in `src/config/appConfig.ts`:

```ts
// src/config/appConfig.ts
export const AppConfig = {
  locale: 'en-US', // Default locale
  currency: 'EUR', // Default currency (set to Euro)
  currencyOptions: {
    USD: { symbol: '$', code: 'USD' },
    EUR: { symbol: '€', code: 'EUR' },
    // Add more options if needed.
  },
};
```

You can change the values here to suit your target market or allow user preferences.

## 2. Formatter Utilities

The formatter file, located at `src/utils/formatter.ts`, imports the configuration from `AppConfig` and uses it to format dates, prices, numbers, etc. In particular, the `formatPrice` function is defined as follows:

```ts
import { AppConfig } from '../config/appConfig';

const DEFAULT_LOCALE = AppConfig.locale;
const DEFAULT_CURRENCY = AppConfig.currency;

/**
 * Format a price with the proper currency symbol.
 * If no currency or locale is provided, the defaults from AppConfig
 * will be used.
 */
export const formatPrice = (
  price: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
};

// ... other formatter functions (formatDate, formatNumber, etc.)
```

Because the function uses the built-in `Intl.NumberFormat`, setting the default currency to `"EUR"` will display prices with the Euro symbol ( € ).

## 3. Using the Formatter in Financial Components

### Wrap Your Application with the Currency Provider

In your main entry file (for example, `src/index.tsx` or `src/App.tsx`), make sure the entire application is wrapped with the `CurrencyProvider` so that any component (including financial charts, dashboards, etc.) can access the current currency settings if necessary.

Example from `App.tsx`:

```tsx
import { CurrencyProvider } from './context/CurrencyContext';
// ...
function App() {
  return (
    <CurrencyProvider>
      {/* ... All your other providers and Routes go here */}
    </CurrencyProvider>
  );
}
export default App;
```

### Import and Use in a Financial Component

Within a financial component (e.g., a dashboard or chart), import the formatter and (optionally) the currency hook. For example:

```tsx
import React from 'react';
import { formatPrice } from '../../utils/formatter';
import { useCurrency } from '../../context/CurrencyContext';

const RevenueWidget: React.FC<{ revenue: number }> = ({ revenue }) => {
  // If you want to use the live setting from the currency provider:
  const { currency, locale } = useCurrency();

  // Option 1: Use the formatter with current settings from the provider:
  const formattedRevenue = formatPrice(revenue, currency, locale);

  // Option 2: Or simply use the default formatter if the defaults are fine:
  // const formattedRevenue = formatPrice(revenue);

  return (
    <div>
      <h3>Revenue</h3>
      <p>{formattedRevenue}</p>
    </div>
  );
};

export default RevenueWidget;
```

### Use in Financial Charts and Reports

For example, when building tooltips for a chart, you can use the `formatPrice` function so that the tooltip displays a properly formatted value:

```tsx
<Tooltip formatter={(value) => formatPrice(value as number)} />
```

This ensures that all price values throughout your financial module are consistent and use the correct symbol and number formatting based on your global configuration.

## 4. Changing the Currency/Locale

The `CurrencyProvider` exposes both the current currency settings and setter functions. If you would like to allow users to change the currency (and/or locale) dynamically, you could add a settings component that uses the `useCurrency` hook:

```tsx
import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const CurrencySettings: React.FC = () => {
  const { currency, setCurrency, locale, setLocale, formatCurrency } =
    useCurrency();

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  return (
    <div>
      <h4>Currency Settings</h4>
      <p>Current Currency: {currency}</p>
      <button onClick={() => handleCurrencyChange('USD')}>Switch to USD</button>
      <button onClick={() => handleCurrencyChange('EUR')}>Switch to EUR</button>
      {/* Similarly, you can manage locale */}
    </div>
  );
};

export default CurrencySettings;
```

This component could be added to a user settings page. The key point is that with the `CurrencyProvider` in place, every component that calls the formatter functions (or uses `useCurrency`) will automatically update based on the global settings.

## Summary

- **Config File:**  
  Store default locale and currency in a central configuration file (`src/config/appConfig.ts`).

- **Formatter Utilities:**  
  Use the config values in the formatter functions so that they automatically apply the default currency symbol (like "€" for `"EUR"`) and locale when formatting prices.

- **Provider Wrapper:**  
  Wrap your app with `CurrencyProvider` so that any component (finance charts, reports, dashboards, etc.) can access the current currency settings.

- **Usage:**  
  Import and use `formatPrice` (and other formatting functions) directly in your financial components. Optionally, use the `useCurrency` hook to retrieve the current currency and locale so that you can display dynamic pricing that follows user preferences.

Using this approach, you ensure consistent currency formatting across your entire frontend while allowing flexibility for future enhancements (such as letting users select their preferred currency).
