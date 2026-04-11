import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaType = searchParams.get("type"); // "movie" | "tv"
    const id = searchParams.get("id");

    if (!mediaType || !id) {
      return NextResponse.json({ error: "Missing type or id parameter" }, { status: 400 });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing TMDB API Key" }, { status: 500 });
    }

    // append_to_response fetches extra related data in a single API call
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${apiKey}&append_to_response=credits,videos`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.status_message || "Failed to fetch details from TMDB");
    }

    const data = await res.json();
    
    // Process the data slightly to make it easier for the frontend
    // Find a YouTube trailer if available
    const trailer = data.videos?.results?.find(
        (vid: any) => vid.site === "YouTube" && vid.type === "Trailer"
    ) || data.videos?.results?.find(
        (vid: any) => vid.site === "YouTube"
    );

    // Get the top 10 cast members
    const cast = data.credits?.cast?.slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path
    })) || [];

    // Map genres
    const genres = data.genres?.map((g: any) => g.name) || [];

    // Watchmode "Where to Watch" Integration
    let watchSources: any[] = [];
    const watchmodeKey = process.env.WATCHMODE_API_KEY || "oDV28R2M3upzg3tvXfV5C6lrv6AvQdDYnWdAEY98";
    
    try {
        const wmSearchField = mediaType === "tv" ? "tmdb_tv_id" : "tmdb_movie_id";
        const wmSearchUrl = `https://api.watchmode.com/v1/search/?apiKey=${watchmodeKey}&search_field=${wmSearchField}&search_value=${id}`;
        
        const wmSearchRes = await fetch(wmSearchUrl);
        if (wmSearchRes.ok) {
            const wmSearchData = await wmSearchRes.json();
            
            if (wmSearchData.title_results && wmSearchData.title_results.length > 0) {
                const wmId = wmSearchData.title_results[0].id;
                
                // Fetch the streaming sources using the internal Watchmode ID
                const wmSourcesUrl = `https://api.watchmode.com/v1/title/${wmId}/sources/?apiKey=${watchmodeKey}`;
                const wmSourcesRes = await fetch(wmSourcesUrl);
                
                if (wmSourcesRes.ok) {
                    const wmSourcesData = await wmSourcesRes.json();
                    
                    // Filter just subscriptions or free sources (e.g. Netflix, Hulu)
                    const bestSources = wmSourcesData.filter((s: any) => s.type === "sub" || s.type === "free");
                    
                    // Remove duplicate provider names (e.g., Netflix US vs Netflix IT, etc.)
                    const uniqueNames = new Set();
                    watchSources = bestSources.filter((s: any) => {
                        if (uniqueNames.has(s.name)) return false;
                        uniqueNames.add(s.name);
                        return true;
                    }).slice(0, 4); // Limit to top 4 providers to keep UI clean
                }
            }
        }
    } catch (wmError) {
        console.warn("Watchmode API failed or limit reached, skipping streaming data:", wmError);
    }

    return NextResponse.json({
      id: data.id,
      title: mediaType === 'tv' ? data.name : data.title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: mediaType === 'tv' ? data.first_air_date : data.release_date,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      genres,
      cast,
      trailerKey: trailer?.key || null,
      mediaType,
      watchSources,
    });

  } catch (error: any) {
    console.error("Detail Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
