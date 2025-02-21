export interface YouTubeVideoSnippet {
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  localized?: {
    title: string;
    description: string;
  };
}

export interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeVideoSnippet;
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    regionRestriction?: {
      allowed?: string[];
      blocked?: string[];
    };
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export interface YouTubePlaylistItemSnippet {
  title: string;
  description: string;
  resourceId: {
    kind: string;
    videoId: string;
  };
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
}

export interface YouTubePlaylistItem {
  id: string;
  snippet: YouTubePlaylistItemSnippet;
}

export interface YouTubeApiResponse<T> {
  kind: string;
  etag: string;
  items: T[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
}
