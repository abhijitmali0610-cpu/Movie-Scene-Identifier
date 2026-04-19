"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2, Film, Star, Calendar, ArrowLeft, Play, X, Heart } from "lucide-react";
import { useFavorites } from "./context/FavoritesContext";

type MovieResult = {
  title: string;
  year: string;
  type: 'movie' | 'tv';
  confidence: number;
  tmdb?: {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    vote_count: number;
  } | null;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MovieResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Overlay state
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResults(null);
    setError(null);
  };

  const identifyMovie = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "LIMIT_REACHED") {
          throw new Error(`LIMIT_REACHED: ${data.message || "Please log in."}`);
        }
        if (data.error === "PAYMENT_REQUIRED") {
            throw new Error(`PAYMENT_REQUIRED: ${data.message || "Upgrade to continue."}`);
        }
        throw new Error(data.error || "Failed to identify the movie");
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (type: 'movie' | 'tv', id: number) => {
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/details?type=${type}&id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetailData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch detailed data.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* --- Detail Overlay Moda --- */}
      {(detailLoading || detailData) && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md overflow-y-auto w-full h-full animate-in fade-in zoom-in-95 duration-300">
            <div className={`relative w-full max-w-5xl bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col my-auto transition-all ${detailLoading ? 'h-96 items-center justify-center' : 'overflow-hidden'}`}>
                 {detailLoading && (
                      <div className="flex flex-col items-center justify-center">
                           <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                           <span className="mt-4 text-neutral-400 font-medium">Loading rich details...</span>
                      </div>
                 )}
                 
                 {detailData && !detailLoading && (
                     <div className="flex flex-col">
                         {/* Controls */}
                         <button onClick={() => { setDetailData(null); setDetailLoading(false); }} className="absolute z-20 top-4 right-4 bg-black/50 hover:bg-black p-2 rounded-full text-white backdrop-blur transition-colors">
                             <X className="w-5 h-5"/>
                         </button>
                         <button onClick={() => { setDetailData(null); setDetailLoading(false); }} className="absolute z-20 top-4 left-4 bg-black/50 hover:bg-black pl-3 pr-4 py-2 rounded-full text-white backdrop-blur flex items-center text-sm font-semibold transition-colors">
                             <ArrowLeft className="w-4 h-4 mr-2"/> Back
                         </button>
                         
                         {/* Backdrop Setup */}
                         <div className="relative w-full h-64 md:h-[400px] overflow-hidden bg-black shrink-0">
                              {detailData.backdrop_path ? (
                                   // eslint-disable-next-line @next/next/no-img-element
                                  <img src={`https://image.tmdb.org/t/p/original${detailData.backdrop_path}`} alt="Backdrop" className="w-full h-full object-cover opacity-50" />
                              ) : <div className="w-full h-full bg-neutral-800" />}
                              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
                         </div>
                         
                         {/* Details Container */}
                         <div className="relative z-10 -mt-24 md:-mt-48 px-6 md:px-10 pb-10 flex flex-col md:flex-row gap-6 md:gap-10 shrink-0">
                              {/* Poster */}
                              <div className="shrink-0 w-32 md:w-64 mx-auto md:mx-0 relative">
                                  <button 
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         if (isFavorite(detailData.id)) {
                                             removeFavorite(detailData.id);
                                         } else {
                                             addFavorite({
                                                 id: detailData.id,
                                                 type: detailData.mediaType || 'movie',
                                                 title: detailData.title,
                                                 poster_path: detailData.poster_path,
                                                 vote_average: detailData.vote_average
                                             });
                                         }
                                     }}
                                     className="absolute top-2 left-2 md:top-4 md:left-4 z-30 p-2.5 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/70 transition-colors border border-white/10 shadow-lg"
                                  >
                                     <Heart className={`w-5 h-5 transition-colors ${isFavorite(detailData.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                  </button>
                                  <div className="rounded-xl md:rounded-2xl overflow-hidden ring-4 ring-neutral-900 shadow-xl bg-neutral-800 aspect-[2/3]">
                                      {detailData.poster_path ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={`https://image.tmdb.org/t/p/w500${detailData.poster_path}`} className="w-full h-full object-cover" alt="Poster" />
                                      ) : <Film className="w-16 h-16 md:w-20 md:h-20 m-auto text-neutral-600 my-10 md:my-20" />}
                                  </div>
                              </div>
                              
                              {/* Text Info */}
                              <div className="flex-1 md:mt-24 space-y-6">
                                  <div className="text-center md:text-left">
                                      <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
                                        {detailData.title}
                                      </h2>
                                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-neutral-300">
                                          {detailData.release_date && <span>{new Date(detailData.release_date).getFullYear()}</span>}
                                          {detailData.genres?.length > 0 && (
                                              <div className="flex items-center gap-2 text-xs">
                                                  {detailData.genres.map((g: string, i: number) => (
                                                      <span key={i} className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">{g}</span>
                                                  ))}
                                              </div>
                                          )}
                                          {detailData.vote_average ? (
                                             <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full"><Star className="w-3.5 h-3.5 fill-yellow-500"/> {detailData.vote_average.toFixed(1)}</span>
                                          ) : null}
                                      </div>
                                  </div>
                                  
                                  <div>
                                      <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                                      <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                                          {detailData.overview || "No overview available for this title."}
                                      </p>
                                  </div>

                                  {detailData.trailerKey && (
                                      <div>
                                           <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
                                           <a href={`https://www.youtube.com/watch?v=${detailData.trailerKey}`} target="_blank" rel="noreferrer" className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg shadow-red-600/20">
                                                <Play className="w-4 h-4 mr-2 fill-current" /> Watch on YouTube
                                           </a>
                                      </div>
                                  )}

                                  {detailData.watchSources && detailData.watchSources.length > 0 && (
                                      <div className="pt-6 mt-6 border-t border-white/5">
                                           <h3 className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-wider">Available to Stream On</h3>
                                           <div className="flex flex-wrap gap-2.5">
                                               {detailData.watchSources.map((source: any, idx: number) => (
                                                    <a key={idx} href={source.web_url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-neutral-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 border border-white/10 hover:border-transparent text-white font-medium rounded-xl text-sm transition-all shadow-md transform hover:-translate-y-0.5">
                                                        {source.name}
                                                    </a>
                                               ))}
                                           </div>
                                      </div>
                                  )}
                              </div>
                         </div>

                         {/* Cast Grid Grid */}
                         {detailData.cast?.length > 0 && (
                             <div className="px-6 md:px-10 pb-10 shrink-0 border-t border-white/5 pt-10 mt-2">
                                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                     <Star className="w-5 h-5 text-purple-400 fill-purple-400/20"/> Top Cast
                                 </h3>
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                      {detailData.cast.map((actor: any) => (
                                          <div key={actor.id} className="flex flex-col bg-neutral-800 rounded-lg overflow-hidden border border-white/5 hover:border-purple-500/30 transition-colors">
                                               <div className="w-full aspect-square bg-neutral-900 border-b border-white/5">
                                                   {actor.profile_path ? (
                                                       // eslint-disable-next-line @next/next/no-img-element
                                                       <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} className="w-full h-full object-cover object-top" alt={actor.name} />
                                                   ) : <div className="w-full h-full flex items-center justify-center text-neutral-600"><Film className="w-8 h-8" /></div>}
                                               </div>
                                               <div className="p-3">
                                                    <p className="font-bold text-white text-xs truncate" title={actor.name}>{actor.name}</p>
                                                    <p className="text-neutral-500 text-[10px] truncate mt-0.5" title={actor.character}>{actor.character}</p>
                                               </div>
                                          </div>
                                      ))}
                                 </div>
                             </div>
                         )}
                     </div>
                 )}
            </div>
        </div>
      )}
      
      {/* --- Main Page UI --- */}
      {/* Hide scrolling strictly on main body if modal open */}
      <div className={`max-w-6xl mx-auto px-6 py-12 md:py-20 lg:py-24 ${detailLoading || detailData ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
        
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl mb-4">
            <Film className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 leading-tight pb-2">
            Scene Identifier
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-medium">
            Upload a snapshot from any movie, TV series, or K-Drama, and our advanced AI vision models will recognize the scene to provide comprehensive metadata instantly.
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          
          <div 
            className={`relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 bg-neutral-900/80 backdrop-blur-md px-6 py-10
              ${previewUrl ? 'border-purple-500/50' : 'border-neutral-700 hover:border-purple-500 hover:bg-neutral-900/60'}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col items-center gap-4">
                 <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                 </div>
                 <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                  className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-4 cursor-pointer">
                <div className="p-4 bg-neutral-800 rounded-full shadow-inner ring-1 ring-white/5">
                  <Upload className="w-10 h-10 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-neutral-200">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    SVG, PNG, JPG or WEBP (max. 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {file && !loading && !results && (
          <div className="flex justify-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={identifyMovie}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.7)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
            >
              <ImageIcon className="w-5 h-5" />
              Identify Scene
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-16 space-y-6 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center w-20 h-20">
               <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
               <Loader2 className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <p className="text-lg font-medium text-neutral-400 tracking-wide">
              Analyzing visual signatures...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-red-500">
            <div className="shrink-0 bg-red-500/20 p-3 rounded-full">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
                <p className="font-medium text-sm md:text-base">
                  {error.startsWith("LIMIT_REACHED: ") ? error.replace("LIMIT_REACHED: ", "") : 
                   error.startsWith("PAYMENT_REQUIRED: ") ? error.replace("PAYMENT_REQUIRED: ", "") :
                   error}
                </p>
                {error.startsWith("LIMIT_REACHED: ") && (
                  <a href="/api/auth/signin" className="inline-block mt-3 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm transition-colors shadow-lg">
                     Sign Up / Login
                  </a>
                )}
                {error.startsWith("PAYMENT_REQUIRED: ") && (
                  <a href="/pricing" className="inline-block mt-3 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-full text-sm transition-all shadow-lg shadow-purple-900/40 transform hover:-translate-y-0.5">
                     View Pricing Plans
                  </a>
                )}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {results && (
          <div className="mt-20 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-center gap-3">
               <div className="h-px w-12 bg-gradient-to-r from-transparent to-neutral-700"></div>
               <h2 className="text-2xl font-bold text-center text-neutral-200">
                 Top 5 Matches
               </h2>
               <div className="h-px w-12 bg-gradient-to-l from-transparent to-neutral-700"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {results.map((result, index) => {
                const isTopMatch = index === 0;
                
                return (
                  <div 
                    key={index}
                    className={`group relative flex flex-col bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2
                      ${isTopMatch ? 'md:col-span-2 lg:col-span-3 flex-col lg:flex-row shadow-xl shadow-purple-900/10 ring-1 ring-purple-500/20' : ''}`}
                  >
                    {isTopMatch && (
                       <div className="absolute top-4 right-4 z-20 px-4 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30 backdrop-blur-md flex items-center gap-1.5">
                         <Star className="w-3.5 h-3.5 fill-purple-400" />
                         Best Match
                       </div>
                    )}
                    
                    {/* Poster Image */}
                    <div className={`relative bg-neutral-950 shrink-0 overflow-hidden
                      ${isTopMatch ? 'w-full lg:w-[350px] aspect-[16/9] lg:aspect-[2/3]' : 'w-full aspect-[2/3]'}`}
                    >
                      <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             if (!result.tmdb?.id) return;
                             if (isFavorite(result.tmdb.id)) {
                                 removeFavorite(result.tmdb.id);
                             } else {
                                 addFavorite({
                                     id: result.tmdb.id,
                                     type: result.type,
                                     title: result.tmdb.title || result.tmdb.name || result.title,
                                     poster_path: result.tmdb.poster_path,
                                     year: result.year,
                                     vote_average: result.tmdb.vote_average
                                 });
                             }
                         }}
                         className="absolute top-4 left-4 z-30 p-2 md:p-2.5 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/70 transition-all border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 shadow-lg translate-y-2 group-hover:translate-y-0"
                      >
                         <Heart className={`w-5 h-5 transition-colors ${result.tmdb?.id && isFavorite(result.tmdb.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>

                      {result.tmdb?.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${result.tmdb.poster_path}`}
                          alt={result.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 space-y-3 bg-neutral-900">
                           <Film className="w-10 h-10" />
                           <span className="text-sm font-medium">No Poster Available</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent lg:hidden" />
                      {!isTopMatch && <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />}
                    </div>

                    <div className={`relative flex flex-col flex-1 p-6 md:p-8 justify-between z-10
                      ${isTopMatch ? '-mt-24 lg:mt-0 bg-neutral-900/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none' : '-mt-24 bg-neutral-900/90 backdrop-blur-md'}`}
                    >
                      <div>
                        {/* Confidence Bar */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-1.5 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-neutral-400 w-10 text-right">
                            {result.confidence}%
                          </span>
                        </div>

                        <h3 className={`font-bold text-white mb-2 leading-tight
                          ${isTopMatch ? 'text-3xl lg:text-5xl lg:mb-4' : 'text-xl md:text-2xl'}`}
                        >
                          {result.tmdb?.title || result.tmdb?.name || result.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-400 mb-6 font-medium">
                          {result.tmdb?.release_date || result.tmdb?.first_air_date ? (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-neutral-500" />
                              {new Date(result.tmdb?.release_date || result.tmdb?.first_air_date || '').getFullYear()}
                            </span>
                          ) : (
                            <span>{result.year}</span>
                          )}
                          
                          {result.tmdb?.vote_average ? (
                             <>
                               <span className="w-1 h-1 rounded-full bg-neutral-700" />
                               <span className="flex items-center gap-1.5 text-yellow-500/90">
                                 <Star className="w-4 h-4 fill-yellow-500/90" />
                                 {result.tmdb.vote_average.toFixed(1)} 
                                 <span className="text-neutral-500 ml-0.5 text-xs">({result.tmdb.vote_count})</span>
                               </span>
                             </>
                          ) : null}
                        </div>

                        {result.tmdb?.overview && (
                          <p className={`text-neutral-400 leading-relaxed
                            ${isTopMatch ? 'text-base md:text-lg line-clamp-4 lg:line-clamp-none' : 'text-sm line-clamp-3'}`}
                          >
                            {result.tmdb.overview}
                          </p>
                        )}
                      </div>
                      
                      {result.tmdb?.id && (
                         <div className="mt-8 pt-6 border-t border-white/5">
                            <button 
                              onClick={() => loadDetails(result.type, result.tmdb!.id)}
                              className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold rounded-full transition-all w-full sm:w-auto shadow-lg shadow-purple-900/40"
                            >
                              View Complete Details
                            </button>
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
