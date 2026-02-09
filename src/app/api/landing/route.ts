import { NextResponse } from 'next/server';

export async function POST() {
  try {
    if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || !process.env.TWITCH_ACCESS_TOKEN) {
      throw new Error("Missing IGDB Credentials");
    }

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
      },
      // ДОБАВИЛИ: summary, involved_companies...
      body: `
        fields name, cover.url, rating, slug, summary, 
        involved_companies.company.name, involved_companies.publisher, involved_companies.developer;
        where category = 0 
        & cover != null 
        & rating > 80 
        & version_parent = null;
        sort popularity desc;
        limit 30;
      `,
    });

    if (!response.ok) {
        throw new Error(`IGDB API Error: ${response.statusText}`);
    }

    const games = await response.json();

    const processedGames = games.map((game: any) => {
      // Ищем разработчика и издателя
      const developer = game.involved_companies?.find((c: any) => c.developer)?.company?.name || 'Unknown';
      const publisher = game.involved_companies?.find((c: any) => c.publisher)?.company?.name || 'Unknown';

      return {
        id: game.id.toString(),
        title: game.name,
        coverUrl: game.cover?.url 
          ? `https:${game.cover.url.replace('t_thumb', 't_720p')}` 
          : null,
        rating: game.rating,
        summary: game.summary, // <-- Теперь передаем описание
        developer,
        publisher
      };
    }).filter((g: any) => g.coverUrl);

    return NextResponse.json({ games: processedGames });
  } catch (error) {
    console.error('IGDB Landing Fetch Error:', error);
    return NextResponse.json({ games: [] }, { status: 500 });
  }
}