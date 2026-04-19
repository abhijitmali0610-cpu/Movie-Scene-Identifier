import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      const cookieStore = await cookies();
      const identifyCount = parseInt(cookieStore.get("identify_count")?.value || "0", 10);
      if (identifyCount >= 1) {
        return NextResponse.json(
          { error: "LIMIT_REACHED", message: "You have reached your free search limit. Please log in for more searches." },
          { status: 401 }
        );
      }
    } else if (session.user?.id) {
      // Admin bypass — unlimited requests
      const ADMIN_EMAILS = ["abhijitmali0610@gmail.com"];
      const isAdmin = ADMIN_EMAILS.includes(session.user?.email ?? "");

      if (!isAdmin) {
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (user) {
          const isPlatinum = user.plan === "PLATINUM" && user.planExpires && user.planExpires > new Date();
          const isGold = user.plan === "GOLD" && user.planExpires && user.planExpires > new Date();

          if (!isPlatinum && !isGold) {
            const allowedSearches = 3 + user.bonusRequests;
            if (user.searchCount >= allowedSearches) {
              return NextResponse.json(
                { error: "PAYMENT_REQUIRED", message: "You have used all your search credits." },
                { status: 402 }
              );
            }
            await db.user.update({
              where: { id: user.id },
              data: { searchCount: user.searchCount + 1 }
            });
          }
        }
      }
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Initialize Gemini (ensure you have GEMINI_API_KEY in .env.local)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing Gemini API Key in .env.local" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Ask Gemini to identify the movie
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        "You are an elite film and television historian with encyclopedic knowledge of global cinema, spanning Hollywood blockbusters, American TV series, and international hits including Korean Dramas (K-Dramas). Carefully analyze this image and accurately identify the exact movie or TV series scene. Provide a list of the top 5 most likely titles globally. If the scene happens to be from a Korean or international production, provide the most widely recognized English title OR the original native title to ensure a precise database match. Include the release year (or first air year), whether it is a movie or tv show, and a confidence score from 0 to 100.",
        { inlineData: { data: base64Data, mimeType: file.type } }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "Analysis of the scene and the resulting matches.",
          properties: {
            visual_analysis: {
              type: Type.STRING,
              description: "EXTREMELY IMPORTANT: Write out a detailed step-by-step visual breakdown. Name recognizable actors, the setting, and unique props. VERY COMMON ERROR: Do not confuse Reacher with The Night Agent. Reacher features a massive, severely muscular bodybuilder (Alan Ritchson) typically in casual/rural settings. The Night Agent features a leaner protagonist (Gabriel Basso) in political, FBI, or White House/tactical environments. You must rigorously analyze body type before outputting Reacher to ensure accuracy!"
            },
            results: {
              type: Type.ARRAY,
              description: "List of top 5 identified movies or TV shows, ordered by confidence.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The precise title of the movie or TV show.",
                  },
                  year: {
                    type: Type.STRING,
                    description: "The release year or first air year.",
                  },
                  type: {
                    type: Type.STRING,
                    description: "Must be exactly 'movie' or 'tv'.",
                  },
                  confidence: {
                    type: Type.NUMBER,
                    description: "Confidence score from 0 to 100 based on your visual analysis.",
                  },
                },
                required: ["title", "year", "type", "confidence"],
              },
            }
          },
          required: ["visual_analysis", "results"],
        },
      },
    });

    const responseText = response.text;
    console.log("Gemini Raw Response:", responseText); // Debug logging

    let aiResults;
    try {
      const parsedData = JSON.parse(responseText || "{}");
      // Extract the results array from the new CoT schema
      aiResults = Array.isArray(parsedData) ? parsedData : (parsedData.results || []);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, responseText);
      return NextResponse.json(
        { error: "AI returned invalid JSON format." },
        { status: 500 }
      );
    }

    if (!Array.isArray(aiResults) || aiResults.length === 0) {
      return NextResponse.json(
        { error: "AI failed to identify any movies or TV shows from the image." },
        { status: 400 }
      );
    }

    // Sort by descending confidence just in case the AI didn't
    aiResults.sort((a: any, b: any) => b.confidence - a.confidence);

    // Enhance with TMDB Data
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
        return NextResponse.json({ error: "Missing TMDB API Key in .env.local" }, { status: 500 });
    }

    // Now look up TMDB metadata for each identified movie/show
    const enrichedResults = await Promise.all(
      aiResults.map(async (result: any) => {
        try {
          const queryParams: Record<string, string> = {
            api_key: tmdbApiKey,
            query: result.title,
            year: result.year,
            include_adult: "false"
          };
          const queryString = new URLSearchParams(queryParams).toString();
          const searchType = result.type.toLowerCase() === 'movie' ? 'movie' : 'tv';
          
          const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/${searchType}?${queryString}`);
          const tmdbData = await tmdbRes.json();
          
          // Original frontend heavily expects result.tmdb object
          if (tmdbData.results && tmdbData.results.length > 0) {
            const bestMatch = tmdbData.results[0];
            return {
              ...result,
              tmdb: bestMatch
            };
          }
          return { ...result, tmdb: null };
        } catch (err) {
          console.warn(`TMDB lookup failed for ${result.title}`, err);
          return { ...result, tmdb: null };
        }
      })
    );

    if (!session) {
      const cookieStore = await cookies();
      cookieStore.set("identify_count", "1", { httpOnly: true, maxAge: 60 * 60 * 24 * 365, path: '/' });
    }

    return NextResponse.json({ results: enrichedResults });

  } catch (error: any) {
    console.error("Error in identification:", error);
    
    // Check if the error is a Rate Limit (429) from Google APIs
    const errorMessage = error.message || "";
    if (error.status === 429 || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("Quota exceeded")) {
      return NextResponse.json(
        { error: "Free Tier Rate Limit Reached! Google allows a maximum of 20 images analyzed per minute. Please wait about 30 seconds and try your next image." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || "Failed to identify the image" },
      { status: 500 }
    );
  }
}
