'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ITEMS, CURRENT_USER } from '../data/items';

const ItemContext = createContext(null);

const STORAGE_KEY = 'campusfind_items_v1';
const USER_STORAGE_KEY = 'campusfind_user_v1';

export function ItemProvider({ children }) {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  // Initialize items & user profile from localStorage or fallback to defaults
  useEffect(() => {
    // Load Items
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        } else {
          setItems(INITIAL_ITEMS);
        }
      } else {
        setItems(INITIAL_ITEMS);
      }
    } catch (err) {
      console.warn('Could not read items from localStorage:', err);
      setItems(INITIAL_ITEMS);
    }

    // Load User Profile
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name) {
          setCurrentUser(parsedUser);
        }
      }
    } catch (err) {
      console.warn('Could not read user profile from localStorage:', err);
    }

    setIsLoaded(true);
  }, []);

  // Sync items back to localStorage — with size-safe error handling
  useEffect(() => {
    if (isLoaded) {
      try {
        const serialized = JSON.stringify(items);
        // Guard: skip write if data exceeds ~4MB to avoid QuotaExceededError
        if (serialized.length < 4_000_000) {
          localStorage.setItem(STORAGE_KEY, serialized);
        } else {
          // Strip base64 images from older items to free space, keep newest 10 fully
          const compactItems = items.map((item, idx) => {
            if (idx < 10) return item; // keep newest 10 as-is
            if (item.image && item.image.startsWith('data:')) {
              return { ...item, image: '/images/placeholder.svg' };
            }
            return item;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(compactItems));
        }
      } catch (err) {
        console.warn('Could not save items to localStorage (quota may be full):', err);
      }
    }
  }, [items, isLoaded]);

  // Sync user profile back to localStorage
  useEffect(() => {
    if (isLoaded && currentUser) {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } catch (err) {
        console.warn('Could not save user profile to localStorage:', err);
      }
    }
  }, [currentUser, isLoaded]);

  // Toast helper
  const showToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, duration);
  };

  const hideToast = () => {
    setToast(null);
  };

  // Update user profile
  const updateUserProfile = (newProfile) => {
    const prevEmail = currentUser.email;
    const prevName = currentUser.name;

    const updated = {
      ...currentUser,
      ...newProfile,
    };

    setCurrentUser(updated);

    // Optionally update items submitted by this user to reflect new name/email/phone
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (
          item.email?.toLowerCase() === prevEmail?.toLowerCase() ||
          item.reporter?.toLowerCase() === prevName?.toLowerCase()
        ) {
          return {
            ...item,
            reporter: updated.name || item.reporter,
            email: updated.email || item.email,
            phone: updated.phone || item.phone,
          };
        }
        return item;
      })
    );

    showToast(`Profile updated for ${updated.name}!`, 'success');
  };

  // Add Lost Item
  const addLostItem = (newItemData) => {
    const newItem = {
      id: Date.now(),
      name: newItemData.name.trim(),
      category: newItemData.category,
      description: newItemData.description.trim(),
      location: newItemData.location.trim(),
      date: newItemData.date || new Date().toISOString().split('T')[0],
      type: 'Lost',
      status: 'Lost',
      image: newItemData.image || '/images/placeholder.svg',
      reporter: newItemData.reporter || currentUser.name,
      email: newItemData.email || currentUser.email,
      phone: newItemData.phone || currentUser.phone,
      createdAt: new Date().toISOString()
    };

    setItems((prev) => [newItem, ...prev]);
    showToast(`Lost item report for "${newItem.name}" published successfully!`, 'success');
    return newItem;
  };

  // Add Found Item
  const addFoundItem = (newItemData) => {
    const newItem = {
      id: Date.now(),
      name: newItemData.name.trim(),
      category: newItemData.category,
      description: newItemData.description.trim(),
      location: newItemData.location.trim(),
      date: newItemData.date || new Date().toISOString().split('T')[0],
      type: 'Found',
      status: 'Found',
      image: newItemData.image || '/images/placeholder.svg',
      reporter: newItemData.reporter || currentUser.name,
      email: newItemData.email || currentUser.email,
      phone: newItemData.phone || currentUser.phone,
      createdAt: new Date().toISOString()
    };

    setItems((prev) => [newItem, ...prev]);
    showToast(`Found item report for "${newItem.name}" published successfully!`, 'success');
    return newItem;
  };

  // Update Item Status (e.g., Mark as Returned / Resolved)
  const updateItemStatus = (id, newStatus) => {
    let updatedItemName = '';
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === Number(id) || item.id === id) {
          updatedItemName = item.name;
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
    showToast(`Item "${updatedItemName || 'listing'}" marked as ${newStatus}!`, 'info');
  };

  // Delete Item
  const deleteItem = (id) => {
    let deletedName = '';
    setItems((prev) => {
      const match = prev.find((item) => item.id === Number(id) || item.id === id);
      if (match) deletedName = match.name;
      return prev.filter((item) => item.id !== Number(id) && item.id !== id);
    });
    showToast(`Report for "${deletedName || 'item'}" has been removed.`, 'warning');
  };

  // Get single item by ID
  const getItemById = (id) => {
    return items.find((item) => String(item.id) === String(id));
  };

  // Get current user's reports
  const getUserReports = (email = currentUser.email) => {
    return items.filter(
      (item) =>
        item.email?.toLowerCase() === email?.toLowerCase() ||
        item.reporter?.toLowerCase() === currentUser.name?.toLowerCase()
    );
  };

  // Reset to initial dummy data
  const resetToSampleData = () => {
    setItems(INITIAL_ITEMS);
    setCurrentUser(CURRENT_USER);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {}
    showToast('Reset data to initial campus listings & default demo student.', 'info');
  };

  // Aggregate statistics
  const stats = {
    totalReports: items.length,
    lostCount: items.filter((i) => i.status === 'Lost').length,
    foundCount: items.filter((i) => i.status === 'Found').length,
    returnedCount: items.filter((i) => i.status === 'Returned').length,
  };

  const value = {
    items,
    isLoaded,
    currentUser,
    updateUserProfile,
    stats,
    toast,
    showToast,
    hideToast,
    addLostItem,
    addFoundItem,
    updateItemStatus,
    deleteItem,
    getItemById,
    getUserReports,
    resetToSampleData,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
}

export function useItems() {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
}
