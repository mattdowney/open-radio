import { NextResponse } from 'next/server';

// Temporary in-memory store for development
// This will be replaced with Vercel KV in production
const tempRatingStore: {
  [trackId: string]: {
    totalRatings: number;
    ratingSum: number;
  };
} = {};

export async function GET(
  request: Request,
  { params }: { params: { trackId: string } },
) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('trackId');

  if (!trackId) {
    return NextResponse.json(
      { error: 'Track ID is required' },
      { status: 400 },
    );
  }

  const trackRatings = tempRatingStore[trackId] || {
    totalRatings: 0,
    ratingSum: 0,
  };

  return NextResponse.json({
    averageRating:
      trackRatings.totalRatings > 0
        ? trackRatings.ratingSum / trackRatings.totalRatings
        : 0,
    totalRatings: trackRatings.totalRatings,
  });
}

export async function POST(request: Request) {
  try {
    const { trackId, rating } = await request.json();

    if (!trackId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid track ID or rating' },
        { status: 400 },
      );
    }

    // Initialize if not exists
    if (!tempRatingStore[trackId]) {
      tempRatingStore[trackId] = {
        totalRatings: 0,
        ratingSum: 0,
      };
    }

    // Update ratings
    tempRatingStore[trackId].totalRatings += 1;
    tempRatingStore[trackId].ratingSum += rating;

    const { totalRatings, ratingSum } = tempRatingStore[trackId];

    return NextResponse.json({
      averageRating: ratingSum / totalRatings,
      totalRatings: totalRatings,
    });
  } catch (error) {
    console.error('Error processing rating:', error);
    return NextResponse.json(
      { error: 'Failed to process rating' },
      { status: 500 },
    );
  }
}
