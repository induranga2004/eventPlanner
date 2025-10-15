import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { buildPlannerApiUrl, getPlannerHeaders } from '../config/api.js';

const EventPlanningContext = createContext(null);

export const EventPlanningProvider = ({ children }) => {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('eventPlanningContext');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEventData(parsed);
      } catch (e) {
        console.error('Failed to parse stored event context:', e);
        localStorage.removeItem('eventPlanningContext');
      }
    }
  }, []);

  // Save to localStorage whenever eventData changes
  useEffect(() => {
    if (eventData) {
      localStorage.setItem('eventPlanningContext', JSON.stringify(eventData));
    }
  }, [eventData]);

  const saveEventData = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Save to state and localStorage
      setEventData(data);
      
      // Persist to backend
      await axios.post(buildPlannerApiUrl('/api/event-context/save'), data, {
        headers: getPlannerHeaders(),
      });
      
      return { success: true };
    } catch (err) {
      console.error('Failed to save event context:', err);
      setError(err.message);
      // Still save locally even if backend fails
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async (campaignId) => {
    // If no campaignId provided, try to load from localStorage
    if (!campaignId) {
      const stored = localStorage.getItem('eventPlanningContext');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setEventData(parsed);
          return parsed;
        } catch (e) {
          console.error('Failed to parse stored event context:', e);
          return null;
        }
      }
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(buildPlannerApiUrl(`/api/event-context/${campaignId}`), {
        headers: getPlannerHeaders(),
      });
      setEventData(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to load event context:', err);
      setError(err.message);
      
      // Fallback to localStorage
      const stored = localStorage.getItem('eventPlanningContext');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setEventData(parsed);
          return parsed;
        } catch (e) {
          console.error('Failed to parse stored event context:', e);
        }
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearEventData = () => {
    setEventData(null);
    localStorage.removeItem('eventPlanningContext');
  };

  const value = {
    eventData,
    saveEventData,
    loadEventData,
    clearEventData,
    loading,
    error,
  };

  return (
    <EventPlanningContext.Provider value={value}>
      {children}
    </EventPlanningContext.Provider>
  );
};

export const useEventPlanning = () => {
  const context = useContext(EventPlanningContext);
  if (!context) {
    throw new Error('useEventPlanning must be used within EventPlanningProvider');
  }
  return context;
};
