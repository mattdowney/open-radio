import { shuffle } from 'lodash';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export interface VideoDetails {
  title: string;
  artist: string;
  thumbnailUrl: string;
  localizedTitle: string;
}

// Cache for video details
const videoDetailsCache = new Map<string, VideoDetails>();

// Batch loading queue
let batchQueue: string[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

function cleanTitle(str: string): string {
  return str
    .replace(/[\(\[\{].*?[\)\]\}]/g, '') // Remove anything in parentheses, brackets, or braces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
}

const processBatch = async (
  videoIds: string[],
): Promise<Map<string, VideoDetails>> => {
  if (!API_KEY) {
    throw new Error('YouTube API key is not configured.');
  }

  const idsString = videoIds.join(',');
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${idsString}&key=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  const results = new Map<string, VideoDetails>();

  if (data.items) {
    data.items.forEach((item: any) => {
      const snippet = item.snippet;
      const fullTitle = cleanTitle(snippet?.title || '');
      const [artist, ...titleParts] = fullTitle.split(' - ');
      const title = titleParts.join(' - ') || fullTitle;

      const details: VideoDetails = {
        title,
        artist,
        thumbnailUrl:
          snippet?.thumbnails?.maxres?.url || snippet?.thumbnails?.high?.url,
        localizedTitle: cleanTitle(snippet?.localized?.title || fullTitle),
      };

      results.set(item.id, details);
      videoDetailsCache.set(item.id, details);
    });
  }

  return results;
};

export async function fetchVideoDetails(
  videoId: string,
): Promise<VideoDetails> {
  // Check cache first
  const cached = videoDetailsCache.get(videoId);
  if (cached) {
    return cached;
  }

  // Add to batch queue
  batchQueue.push(videoId);

  // Process batch after a short delay or when queue is full
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }

  const result = new Promise<VideoDetails>((resolve, reject) => {
    batchTimeout = setTimeout(async () => {
      try {
        const currentBatch = [...batchQueue];
        batchQueue = [];
        const results = await processBatch(currentBatch);
        const details = results.get(videoId);
        if (!details) {
          throw new Error('Video details not found');
        }
        resolve(details);
      } catch (error) {
        reject(error);
      }
    }, 50); // 50ms delay to batch requests
  });

  return result;
}

export async function fetchPlaylistItems(
  playlistId: string,
): Promise<string[]> {
  if (!API_KEY) {
    throw new Error('YouTube API key is not configured.');
  }

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `API Error: ${errorData.error?.message || 'Unknown error'}`,
    );
  }

  const data = await response.json();

  if (!data || !data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid playlist data received.');
  }

  const videoIds = data.items
    .filter((item: any) => item?.snippet?.resourceId?.videoId)
    .map((item: any) => item.snippet.resourceId.videoId);

  if (videoIds.length === 0) {
    throw new Error('No videos found in playlist.');
  }

  // Preload first few videos' details
  const preloadBatch = videoIds.slice(0, 5);
  processBatch(preloadBatch).catch(console.error);

  return shuffle(videoIds);
}
