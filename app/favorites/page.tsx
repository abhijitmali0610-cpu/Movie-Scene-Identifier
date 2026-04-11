"use client";

import { useFavorites } from "@/app/context/FavoritesContext";
import { Film, Calendar, Star, Heart, ArrowLeft } from "lucide-react";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-6 py-12 md:py-20 lg:py-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-tr from-pink-500/20 to-red-500/20 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl mb-4">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500/20" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-red-400 leading-tight pb-2">
            Your Favorites
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-medium">
            Your carefully curated collection of visually stunning scenes, secured via LocalStorage.
          </p>
      </div>

      {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-20 bg-neutral-900 border border-white/5 rounded-3xl shadow-xl">
             <Heart className="w-16 h-16 text-neutral-700 mb-6" />
             <h2 className="text-2xl font-bold text-white mb-2">No favorites just yet!</h2>
             <p className="text-neutral-400 text-center px-8 mb-8">
                Whenever you identify an impressive scene on the home page, tap the heart icon on any poster to save it here indefinitely.
             </p>
             <a href="/" className="inline-flex items-center justify-center px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-full transition-colors">
                 <ArrowLeft className="w-4 h-4 mr-2" /> Start Visual Searching
             </a>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {favorites.map((movie) => (
              <div 
                key={movie.id}
                className="group relative flex flex-col bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden hover:border-pink-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-2"
              >
                
                {/* Poster Image */}
                <div className="relative bg-neutral-950 shrink-0 overflow-hidden w-full aspect-[2/3]">
                  <button 
                     onClick={(e) => {
                         e.stopPropagation();
                         removeFavorite(movie.id);
                     }}
                     className="absolute top-4 right-4 z-30 p-2.5 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/80 transition-all border border-white/10 opacity-100 group-hover:scale-110 shadow-lg"
                  >
                     <Heart className="w-5 h-5 transition-colors fill-red-500 text-red-500 hover:fill-neutral-500 hover:text-neutral-500" />
                  </button>

                  <div className="absolute top-4 left-4 z-30 px-2 py-1 bg-black/60 rounded-md backdrop-blur-md border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                     {movie.type}
                  </div>

                  {movie.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 space-y-3 bg-neutral-900">
                       <Film className="w-10 h-10" />
                       <span className="text-sm font-medium">No Poster Available</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative flex flex-col flex-1 p-6 justify-between z-10 -mt-20 bg-neutral-900/90 backdrop-blur-md">
                  <div>
                    <h3 className="font-bold text-white mb-3 text-xl leading-tight line-clamp-2" title={movie.title}>
                      {movie.title}
                    </h3>

                    <div className="flex flex-wrap items-center justify-between text-sm text-neutral-400 font-medium w-full">
                      {movie.year ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          {movie.year}
                        </span>
                      ) : <span />}
                      
                      {movie.vote_average ? (
                        <span className="flex items-center gap-1.5 text-yellow-500/90 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                          <Star className="w-3.5 h-3.5 fill-yellow-500/90" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}
    </main>
  );
}
