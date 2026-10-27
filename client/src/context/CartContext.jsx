import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

// The customer's in-progress rental request ("cart"), saved per user in localStorage
const CartContext = createContext(null);

const storageKey = (user) => (user ? `rentkit_cart_${user._id}` : null);
// Event dates chosen while browsing (works for guests too), carried through to the request page
const DATES_KEY = 'rentkit_event_dates';

function readDates() {
  try {
    return JSON.parse(localStorage.getItem(DATES_KEY)) || { start: '', end: '' };
  } catch {
    return { start: '', end: '' };
  }
}

function readCart(user) {
  const key = storageKey(user);
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => readCart(user));
  const [dates, setDatesState] = useState(readDates);

  const setDates = useCallback((next) => {
    setDatesState(next);
    try {
      localStorage.setItem(DATES_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable: dates just won't persist
    }
  }, []);

  // Load the right cart when the logged-in user changes
  useEffect(() => {
    setItems(readCart(user));
  }, [user]);

  const persist = useCallback(
    (updater) => {
      setItems((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const key = storageKey(user);
        if (key) localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [user]
  );

  const addItem = useCallback(
    (equipment, quantity = 1) =>
      persist((prev) => {
        const existing = prev.find((i) => i.equipment._id === equipment._id);
        if (existing) {
          return prev.map((i) => (i.equipment._id === equipment._id ? { ...i, quantity: i.quantity + quantity } : i));
        }
        const { _id, name, category, dailyRate, imageUrl, quantityTotal } = equipment;
        return [...prev, { equipment: { _id, name, category, dailyRate, imageUrl, quantityTotal }, quantity }];
      }),
    [persist]
  );

  const updateQuantity = useCallback(
    (id, quantity) => persist((prev) => prev.map((i) => (i.equipment._id === id ? { ...i, quantity } : i))),
    [persist]
  );

  const removeItem = useCallback((id) => persist((prev) => prev.filter((i) => i.equipment._id !== id)), [persist]);
  const clear = useCallback(() => {
    persist([]);
    setDates({ start: '', end: '' });
  }, [persist, setDates]);

  const value = useMemo(
    () => ({ items, count: items.length, addItem, updateQuantity, removeItem, clear, dates, setDates }),
    [items, addItem, updateQuantity, removeItem, clear, dates, setDates]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
