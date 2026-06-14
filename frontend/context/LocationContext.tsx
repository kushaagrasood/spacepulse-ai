"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface LocationData {
  lat: number;
  lon: number;
  city: string;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: boolean;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  loading: true,
  error: false,
});

export function LocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location, setLocation] =
    useState<LocationData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const data = await res.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "Unknown";

          const state =
            data.address?.state || "";

          setLocation({
            lat: latitude,
            lon: longitude,
            city: state
              ? `${city}, ${state}`
              : city,
          });
        } catch {
          setError(true);
        }

        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}