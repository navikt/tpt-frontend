/**
 * Generic localStorage helpers for caching data
 */

// Helper to get a stored number from localStorage
export const getStoredNumber = (key: string): number | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : null;
};

// Helper to store a number in localStorage
export const setStoredNumber = (key: string, value: number) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value.toString());
};

// Helper to get cached JSON data from localStorage
export const getStoredJSON = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Helper to store JSON data in localStorage
export const setStoredJSON = <T>(key: string, data: T) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to store data in localStorage:", error);
  }
};

// Helper to clear a localStorage key
export const clearStoredItem = (key: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};
