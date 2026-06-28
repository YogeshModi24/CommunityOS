'use client';

import { useEffect, useState } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

// Bikaner fallback coordinates
const BIKANER_LAT = 28.0229;
const BIKANER_LNG = 73.3119;

export function useGeolocation(): GeolocationState & { fallback: boolean } {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
  });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ lat: BIKANER_LAT, lng: BIKANER_LNG, error: null, loading: false });
      setFallback(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        });
        setFallback(false);
      },
      () => {
        // On denial, use Bikaner as fallback — demo always works
        setState({ lat: BIKANER_LAT, lng: BIKANER_LNG, error: null, loading: false });
        setFallback(true);
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, fallback };
}
