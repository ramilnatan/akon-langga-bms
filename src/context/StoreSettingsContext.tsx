import React, { createContext, useContext, useEffect, useState } from 'react';
import { StoreSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../constants/defaults';
import { supabase } from '../services/supabase';

interface StoreSettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('store_settings')
        .select('id, store_name, tagline, logo_url, favicon_url, primary_phone, email, facebook_url, messenger_url, whatsapp, address, business_hours, currency, seo_title, seo_description, seo_keywords, og_image_url, shipping_fee, created_at, updated_at')
        .limit(1)
        .single();

      if (error) throw error;
      if (data) setSettings(data as StoreSettings);
    } catch (err) {
      console.error('Error fetching store settings:', err);
      setError('Failed to load store settings, using defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider value={{ settings, loading, error, refreshSettings: fetchSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};
