import { NextResponse } from 'next/server';

interface IGDBGame {
  id: number;
  name: string;
  first_release_date?: number;
  cover?: { url: string };
  total_rating?: number;
  platforms?: { name: string }[];
  summary?: string;
  involved_companies?: {
    developer: boolean;
    publisher: boolean;
    company: { name: string };
  }[];
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ games: [] });
    }

    // 0. Sanitisation 
    const sanitizedQuery = query.replace(/["]/g, "");

    // 1. Token Twitch
    
    const clientId = process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'Missing Server Keys' }, { status: 500 });
    }

    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );

    const tokenData = await tokenResponse.json();
    
    // 2. Request to IGDB
    const igdbQuery = `
      fields name, first_release_date, cover.url, total_rating, platforms.name, summary, 
      involved_companies.company.name, involved_companies.developer, involved_companies.publisher;
      search "${sanitizedQuery}";
      where cover != null & version_parent = null;
      limit 12;
    `;

    const gamesResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: igdbQuery,
    });

    const gamesData: IGDBGame[] = await gamesResponse.json();

    // 3. Formatting
    const formattedGames = gamesData.map((game) => {
      
      
      let companyName = "Unknown Studio";
      let publisherName = "Unknown Publisher";
      
      if (game.involved_companies) {
        const dev = game.involved_companies.find(c => c.developer);
        const pub = game.involved_companies.find(c => c.publisher);
        
        if (dev) companyName = dev.company.name;
        if (pub) publisherName = pub.company.name;
        
        // If no publisher is found, but there is a developer -> we consider it self-published.
        if (!pub && dev) publisherName = dev.company.name;
      }

     
      const coverUrl = game.cover?.url 
        ? `https:${game.cover.url.replace('t_thumb', 't_720p')}` 
        : '';

      return {
        id: game.id.toString(),
        title: game.name,
        releaseYear: game.first_release_date 
          ? new Date(game.first_release_date * 1000).getFullYear() 
          : new Date().getFullYear(),
        
        coverUrl: coverUrl,
        rating: game.total_rating ? Math.round(game.total_rating / 20 * 10) / 10 : 0,
        status: 'BACKLOG',
        addedAt: Date.now(),
        playedOn: game.platforms?.[0]?.name || 'PC',
        
        developer: companyName,
        publisher: publisherName, 

        
        description: game.summary || "No description available.",
        userReview: '' 
      };
    });

    return NextResponse.json({ games: formattedGames });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}