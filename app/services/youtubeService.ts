import { shuffle } from 'lodash';
import { 
  YouTubeVideoItem, 
  YouTubePlaylistItem, 
  YouTubeApiResponse 
} from '../types/youtube';
import { TrackDetails, ValidatedTrack } from '../types/track';

export class YouTubeAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'YouTubeAPIError';
  }
}

export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new YouTubeAPIError('YouTube API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Fetch playlist items and return shuffled video IDs
   */
  async fetchPlaylistItems(playlistId: string): Promise<string[]> {
    const url = `${this.baseUrl}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new YouTubeAPIError(
          `API Error: ${errorData.error?.message || 'Unknown error'}`,
          response.status
        );
      }

      const data: YouTubeApiResponse<YouTubePlaylistItem> = await response.json();

      if (!data || !data.items || !Array.isArray(data.items)) {
        throw new YouTubeAPIError('Invalid playlist data received');
      }

      const videoIds = data.items
        .filter((item): item is YouTubePlaylistItem => 
          item?.snippet?.resourceId?.videoId != null
        )
        .map(item => item.snippet.resourceId.videoId);

      if (videoIds.length === 0) {
        throw new YouTubeAPIError('No videos found in playlist');
      }

      return shuffle(videoIds);
    } catch (error) {
      if (error instanceof YouTubeAPIError) {
        throw error;
      }
      throw new YouTubeAPIError(`Failed to fetch playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch video details for a single video
   */
  async fetchVideoDetails(videoId: string): Promise<TrackDetails> {
    if (!videoId) {
      throw new YouTubeAPIError('Invalid video ID');
    }

    const url = `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new YouTubeAPIError(`API request failed: ${response.status}`, response.status);
      }

      const data: YouTubeApiResponse<YouTubeVideoItem> = await response.json();

      if (!data?.items?.length) {
        throw new YouTubeAPIError(`Video ${videoId} is no longer available`);
      }

      const item = data.items[0];
      const snippet = item.snippet;

      if (!snippet) {
        throw new YouTubeAPIError('Invalid video data structure');
      }

      return this.parseVideoDetails(snippet);
    } catch (error) {
      if (error instanceof YouTubeAPIError) {
        throw error;
      }
      throw new YouTubeAPIError(`Failed to fetch video details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a track by fetching its details
   */
  async validateTrack(trackId: string): Promise<ValidatedTrack | null> {
    try {
      const details = await this.fetchVideoDetails(trackId);
      return {
        id: trackId,
        details,
        isValid: true,
      };
    } catch (error) {
      console.error(`Track ${trackId} validation failed:`, error);
      return null;
    }
  }

  /**
   * Validate multiple tracks in parallel
   */
  async validateTracks(trackIds: string[]): Promise<ValidatedTrack[]> {
    const validationPromises = trackIds.map(id => this.validateTrack(id));
    const results = await Promise.all(validationPromises);
    return results.filter((track): track is ValidatedTrack => track !== null);
  }

  /**
   * Parse video snippet into TrackDetails
   */
  private parseVideoDetails(snippet: YouTubeVideoItem['snippet']): TrackDetails {
    const fullTitle = snippet.title || '';
    const [artist, ...titleParts] = fullTitle.split(' - ');
    const title = titleParts.join(' - ') || fullTitle;

    // Use highest quality thumbnail available
    const albumCoverUrl = 
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url;

    if (!albumCoverUrl) {
      throw new YouTubeAPIError('No thumbnail available');
    }

    const localizedTitle = snippet.localized?.title || fullTitle;

    return {
      artist,
      title,
      albumCoverUrl,
      localizedTitle,
    };
  }

  /**
   * Check if API key is valid
   */
  async checkApiKey(): Promise<boolean> {
    try {
      const testUrl = `${this.baseUrl}/search?part=snippet&q=test&maxResults=1&key=${this.apiKey}`;
      const response = await fetch(testUrl);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let youtubeServiceInstance: YouTubeService | null = null;

export function getYouTubeService(): YouTubeService {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new YouTubeAPIError('YouTube API key not configured');
  }

  if (!youtubeServiceInstance) {
    youtubeServiceInstance = new YouTubeService(apiKey);
  }

  return youtubeServiceInstance;
}

export function resetYouTubeService(): void {
  youtubeServiceInstance = null;
}