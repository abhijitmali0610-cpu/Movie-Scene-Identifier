"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type FavoriteMovie = {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
};

type FavoritesContextType = {
  favorites: FavoriteMovie[];
  addFavorite: (movie: FavoriteMovie) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('visualSearchFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage favorites", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('visualSearchFavorites', JSON.stringify(favorites));
    }
  }, [favorites, isMounted]);

  const addFavorite = (movie: FavoriteMovie) => {
    setFavorites((prev) => {
      // Prevent duplicates
      if (!prev.find((f) => f.id === movie.id)) {
        return [movie, ...prev]; // Add newest to the top
      }
      return prev;
    });
  };

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isFavorite = (id: number) => {
    return favorites.some((f) => f.id === id);
  };

  // We return children without Provider values natively during the initial SSR render 
  // to avoid hydration warning issues from different window.localStorage values.
  if (!isMounted) {
    return <FavoritesContext.Provider value={{ favorites: [], addFavorite, removeFavorite, isFavorite: () => false }}>{children}</FavoritesContext.Provider>;
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
