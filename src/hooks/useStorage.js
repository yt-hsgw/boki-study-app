import { useState } from 'react';

export const useStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage?.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      console.warn(`Failed to read localStorage key "${key}":`, e);
      return initialValue;
    }
  });

  const updateValue = (newValue) => {
    try {
      const val = newValue instanceof Function ? newValue(value) : newValue;
      setValue(val);
      window.localStorage?.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Failed to write to localStorage key "${key}":`, e);
    }
  };

  return [value, updateValue];
};
