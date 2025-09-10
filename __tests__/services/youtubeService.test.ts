import { YouTubeService, YouTubeAPIError, getYouTubeService, resetYouTubeService } from '@/app/services/youtubeService'

// Mock lodash shuffle
jest.mock('lodash', () => ({
  shuffle: jest.fn((array) => [...array]) // Return array as-is for predictable testing
}))

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Helper to create complete mock Response objects
const createMockResponse = (data: any, options: { ok?: boolean; status?: number } = {}) => {
  const response = {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(''),
    headers: new Headers(),
    redirected: false,
    statusText: options.ok === false ? 'Error' : 'OK',
    type: 'basic' as ResponseType,
    url: '',
  }
  return response as Response
}

describe('YouTubeService', () => {
  let service: YouTubeService

  beforeEach(() => {
    service = new YouTubeService('test-api-key')
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('throws error when API key is not provided', () => {
      expect(() => new YouTubeService('')).toThrow(YouTubeAPIError)
      expect(() => new YouTubeService('')).toThrow('YouTube API key is required')
    })

    it('creates service instance with valid API key', () => {
      const service = new YouTubeService('valid-key')
      expect(service).toBeInstanceOf(YouTubeService)
    })
  })

  describe('fetchPlaylistItems', () => {
    const mockPlaylistResponse = {
      items: [
        {
          snippet: {
            resourceId: {
              videoId: 'video1'
            }
          }
        },
        {
          snippet: {
            resourceId: {
              videoId: 'video2'
            }
          }
        },
        {
          snippet: {
            resourceId: {
              videoId: 'video3'
            }
          }
        }
      ]
    }

    it('fetches and returns shuffled playlist items', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockPlaylistResponse))

      const result = await service.fetchPlaylistItems('test-playlist')

      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=test-playlist&maxResults=50&key=test-api-key'
      )
      expect(result).toHaveLength(3)
      expect(result).toContain('video1')
      expect(result).toContain('video2')
      expect(result).toContain('video3')
    })

    it('throws error when API response is not ok', async () => {
      const errorResponse = {
        error: {
          message: 'Invalid playlist ID'
        }
      }

      mockFetch.mockResolvedValue(createMockResponse(errorResponse, { ok: false, status: 404 }))

      await expect(service.fetchPlaylistItems('invalid-playlist')).rejects.toThrow(YouTubeAPIError)
      await expect(service.fetchPlaylistItems('invalid-playlist')).rejects.toThrow('API Error: Invalid playlist ID')
    })

    it('throws error when playlist has no videos', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ items: [] }))

      await expect(service.fetchPlaylistItems('empty-playlist')).rejects.toThrow(YouTubeAPIError)
      await expect(service.fetchPlaylistItems('empty-playlist')).rejects.toThrow('No videos found in playlist')
    })

    it('filters out items without video IDs', async () => {
      const responseWithInvalidItems = {
        items: [
          {
            snippet: {
              resourceId: {
                videoId: 'video1'
              }
            }
          },
          {
            snippet: {
              resourceId: {
                // Missing videoId
              }
            }
          },
          {
            snippet: {
              resourceId: {
                videoId: 'video2'
              }
            }
          }
        ]
      }

      mockFetch.mockResolvedValue(createMockResponse(responseWithInvalidItems))

      const result = await service.fetchPlaylistItems('test-playlist')
      expect(result).toHaveLength(2)
      expect(result).toContain('video1')
      expect(result).toContain('video2')
    })

    it('throws error when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(service.fetchPlaylistItems('test-playlist')).rejects.toThrow(YouTubeAPIError)
      await expect(service.fetchPlaylistItems('test-playlist')).rejects.toThrow('Failed to fetch playlist: Network error')
    })

    it('throws error when response data is invalid', async () => {
      mockFetch.mockResolvedValue(createMockResponse(null))

      await expect(service.fetchPlaylistItems('test-playlist')).rejects.toThrow(YouTubeAPIError)
      await expect(service.fetchPlaylistItems('test-playlist')).rejects.toThrow('Invalid playlist data received')
    })
  })

  describe('fetchVideoDetails', () => {
    const mockVideoResponse = {
      items: [
        {
          snippet: {
            title: 'Artist Name - Song Title',
            thumbnails: {
              maxres: {
                url: 'https://example.com/maxres.jpg'
              },
              high: {
                url: 'https://example.com/high.jpg'
              }
            },
            localized: {
              title: 'Localized Artist - Localized Song'
            }
          }
        }
      ]
    }

    it('fetches and parses video details correctly', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockVideoResponse))

      const result = await service.fetchVideoDetails('test-video')

      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=test-video&key=test-api-key'
      )
      expect(result).toEqual({
        artist: 'Artist Name',
        title: 'Song Title',
        albumCoverUrl: 'https://example.com/maxres.jpg',
        localizedTitle: 'Localized Artist - Localized Song'
      })
    })

    it('throws error for invalid video ID', async () => {
      await expect(service.fetchVideoDetails('')).rejects.toThrow(YouTubeAPIError)
      await expect(service.fetchVideoDetails('')).rejects.toThrow('Invalid video ID')
    })

    it('throws error when video is not available', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ items: [] }))

      await expect(service.fetchVideoDetails('missing-video')).rejects.toThrow(YouTubeAPIError)
      await expect(service.fetchVideoDetails('missing-video')).rejects.toThrow('Video missing-video is no longer available')
    })

    it('uses fallback thumbnails when maxres is not available', async () => {
      const responseWithFallbackThumbnail = {
        items: [
          {
            snippet: {
              title: 'Test Video',
              thumbnails: {
                medium: {
                  url: 'https://example.com/medium.jpg'
                }
              }
            }
          }
        ]
      }

      mockFetch.mockResolvedValue(createMockResponse(responseWithFallbackThumbnail))

      const result = await service.fetchVideoDetails('test-video')
      expect(result.albumCoverUrl).toBe('https://example.com/medium.jpg')
    })

    it('handles video titles without artist separator', async () => {
      const responseWithoutArtist = {
        items: [
          {
            snippet: {
              title: 'Just a Song Title',
              thumbnails: {
                default: {
                  url: 'https://example.com/default.jpg'
                }
              }
            }
          }
        ]
      }

      mockFetch.mockResolvedValue(createMockResponse(responseWithoutArtist))

      const result = await service.fetchVideoDetails('test-video')
      expect(result.artist).toBe('Just a Song Title')
      expect(result.title).toBe('Just a Song Title')
    })

    it('throws error when no thumbnail is available', async () => {
      const responseWithoutThumbnail = {
        items: [
          {
            snippet: {
              title: 'Test Video',
              thumbnails: {}
            }
          }
        ]
      }

      mockFetch.mockResolvedValue(createMockResponse(responseWithoutThumbnail))

      await expect(service.fetchVideoDetails('test-video')).rejects.toThrow(YouTubeAPIError)
      await expect(service.fetchVideoDetails('test-video')).rejects.toThrow('No thumbnail available')
    })
  })

  describe('validateTrack', () => {
    it('returns validated track for valid video', async () => {
      const mockDetails = {
        artist: 'Test Artist',
        title: 'Test Song',
        albumCoverUrl: 'https://example.com/thumb.jpg',
        localizedTitle: 'Test Artist - Test Song'
      }

      mockFetch.mockResolvedValue(createMockResponse({
        items: [
          {
            snippet: {
              title: 'Test Artist - Test Song',
              thumbnails: {
                maxres: {
                  url: 'https://example.com/thumb.jpg'
                }
              }
            }
          }
        ]
      }))

      const result = await service.validateTrack('valid-video')

      expect(result).toEqual({
        id: 'valid-video',
        details: mockDetails,
        isValid: true
      })
    })

    it('returns null for invalid video', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ items: [] }))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = await service.validateTrack('invalid-video')
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Track invalid-video validation failed:',
        expect.any(YouTubeAPIError)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('validateTracks', () => {
    it('validates multiple tracks and filters out null results', async () => {
      // Mock successful response for first video
      mockFetch
        .mockResolvedValueOnce(createMockResponse({
          items: [
            {
              snippet: {
                title: 'Artist 1 - Song 1',
                thumbnails: {
                  maxres: {
                    url: 'https://example.com/thumb1.jpg'
                  }
                }
              }
            }
          ]
        }))
        // Mock failed response for second video
        .mockResolvedValueOnce(createMockResponse({ items: [] }))
        // Mock successful response for third video
        .mockResolvedValueOnce(createMockResponse({
          items: [
            {
              snippet: {
                title: 'Artist 3 - Song 3',
                thumbnails: {
                  maxres: {
                    url: 'https://example.com/thumb3.jpg'
                  }
                }
              }
            }
          ]
        }))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await service.validateTracks(['video1', 'invalid-video', 'video3'])

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('video1')
      expect(result[1].id).toBe('video3')

      consoleSpy.mockRestore()
    })

    it('returns empty array when all tracks are invalid', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ items: [] }))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await service.validateTracks(['invalid1', 'invalid2'])

      expect(result).toEqual([])

      consoleSpy.mockRestore()
    })
  })

  describe('checkApiKey', () => {
    it('returns true for valid API key', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}))

      const result = await service.checkApiKey()

      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=test-api-key'
      )
    })

    it('returns false for invalid API key', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 401 }))

      const result = await service.checkApiKey()

      expect(result).toBe(false)
    })

    it('returns false when fetch throws error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await service.checkApiKey()

      expect(result).toBe(false)
    })
  })
})

describe('YouTube Service Singleton', () => {
  const originalEnv = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

  beforeEach(() => {
    resetYouTubeService()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY = originalEnv
    resetYouTubeService()
  })

  it('creates singleton instance with API key from environment', () => {
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY = 'env-api-key'

    const service1 = getYouTubeService()
    const service2 = getYouTubeService()

    expect(service1).toBe(service2) // Same instance
    expect(service1).toBeInstanceOf(YouTubeService)
  })

  it('throws error when API key is not configured in environment', () => {
    delete process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

    expect(() => getYouTubeService()).toThrow(YouTubeAPIError)
    expect(() => getYouTubeService()).toThrow('YouTube API key not configured')
  })

  it('resets singleton instance', () => {
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY = 'env-api-key'

    const service1 = getYouTubeService()
    resetYouTubeService()
    const service2 = getYouTubeService()

    expect(service1).not.toBe(service2) // Different instances after reset
  })
})

describe('YouTubeAPIError', () => {
  it('creates error with message only', () => {
    const error = new YouTubeAPIError('Test error')

    expect(error.message).toBe('Test error')
    expect(error.name).toBe('YouTubeAPIError')
    expect(error.statusCode).toBeUndefined()
  })

  it('creates error with message and status code', () => {
    const error = new YouTubeAPIError('API Error', 404)

    expect(error.message).toBe('API Error')
    expect(error.name).toBe('YouTubeAPIError')
    expect(error.statusCode).toBe(404)
  })
})