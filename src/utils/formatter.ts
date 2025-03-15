// Format a date string to a more user-friendly format
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

// Format a price with proper currency symbol
export const formatPrice = (
  price: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
};

// Format a number with commas for thousands separator
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("en-US").format(number);
};

// Truncate a long string with ellipsis
export const truncateString = (str: string, maxLength: number = 50): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

// Format a dimension (length, width, thickness)
export const formatDimension = (value: number, unit: string = "mm"): string => {
  return `${value} ${unit}`;
};

// Format an area measurement
export const formatArea = (value: number, unit: string = "sqft"): string => {
  return `${value} ${unit}`;
};

// Convert snake_case or SNAKE_CASE to Title Case
export const snakeToTitleCase = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Convert camelCase to Title Case
export const camelToTitleCase = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
};

// Format a unit of measurement to be more readable
export const formatUnit = (unit: string, quantity: number = 1): string => {
  const unitFormatted = snakeToTitleCase(unit);

  // Handle special plural cases
  if (quantity !== 1) {
    // Add 's' to singular units that need it
    switch (unit.toLowerCase()) {
      case "piece":
        return "Pieces";
      case "foot":
        return "Feet";
      case "inch":
        return "Inches";
      default:
        // Add 's' if doesn't already end with 's'
        return unitFormatted.endsWith("s")
          ? unitFormatted
          : `${unitFormatted}s`;
    }
  }

  return unitFormatted;
};

// Format a file size (for attachments, documentation, etc.)
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format a time duration (for projects, tasks)
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hr${hours !== 1 ? "s" : ""} ${remainingMinutes} min${
    remainingMinutes !== 1 ? "s" : ""
  }`;
};
