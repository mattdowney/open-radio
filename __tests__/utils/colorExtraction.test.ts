import { extractColorsFromImage, generateShaderColors, ExtractedColors } from '@/app/utils/colorExtraction'

// Mock ColorThief
const mockGetColor = jest.fn()
const mockGetPalette = jest.fn()

jest.mock('colorthief', () => {
  return jest.fn().mockImplementation(() => ({
    getColor: mockGetColor,
    getPalette: mockGetPalette,
  }))
})

// Mock Image constructor
const mockImage = {
  crossOrigin: '',
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
}

global.Image = jest.fn(() => mockImage) as any

describe('colorExtraction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockImage.crossOrigin = ''
    mockImage.onload = null
    mockImage.onerror = null
    mockImage.src = ''
  })

  describe('extractColorsFromImage', () => {
    it('extracts colors and returns them in hex format', async () => {
      // Mock ColorThief responses
      mockGetColor.mockReturnValue([255, 128, 64]) // RGB values
      mockGetPalette.mockReturnValue([
        [255, 0, 0],   // Red
        [0, 255, 0],   // Green
        [0, 0, 255],   // Blue
        [128, 128, 128] // Gray
      ])

      const extractPromise = extractColorsFromImage('https://example.com/image.jpg')

      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload()
        }
      }, 0)

      const result = await extractPromise

      expect(result).toEqual({
        dominant: '#ff8040',
        palette: ['#ff0000', '#00ff00', '#0000ff', '#808080']
      })
      expect(mockImage.crossOrigin).toBe('anonymous')
      expect(mockImage.src).toBe('https://example.com/image.jpg')
    })

    it('rejects when image fails to load', async () => {
      const extractPromise = extractColorsFromImage('https://example.com/invalid.jpg')

      // Simulate image load error
      setTimeout(() => {
        if (mockImage.onerror) {
          mockImage.onerror()
        }
      }, 0)

      await expect(extractPromise).rejects.toThrow('Failed to load image for color extraction')
    })

    it('rejects when ColorThief throws an error', async () => {
      mockGetColor.mockImplementation(() => {
        throw new Error('ColorThief error')
      })

      const extractPromise = extractColorsFromImage('https://example.com/image.jpg')

      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload()
        }
      }, 0)

      await expect(extractPromise).rejects.toThrow('ColorThief error')
    })

    it('handles edge case RGB values correctly', async () => {
      // Test edge cases: 0, 255, and mid-range values
      mockGetColor.mockReturnValue([0, 255, 127])
      mockGetPalette.mockReturnValue([
        [255, 255, 255], // White
        [0, 0, 0],       // Black
        [127, 127, 127], // Mid gray
        [1, 254, 2]      // Near edge values
      ])

      const extractPromise = extractColorsFromImage('https://example.com/image.jpg')

      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload()
        }
      }, 0)

      const result = await extractPromise

      expect(result).toEqual({
        dominant: '#00ff7f',
        palette: ['#ffffff', '#000000', '#7f7f7f', '#01fe02']
      })
    })
  })

  describe('generateShaderColors', () => {
    const mockExtractedColors: ExtractedColors = {
      dominant: '#ff8040',
      palette: ['#ff0000', '#00ff00', '#0000ff', '#808080']
    }

    it('generates an array of 4 shader colors', () => {
      const result = generateShaderColors(mockExtractedColors)
      expect(result).toHaveLength(4)
      expect(Array.isArray(result)).toBe(true)
    })

    it('returns colors in hex format', () => {
      const result = generateShaderColors(mockExtractedColors)
      result.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('darkens the dominant color for first two colors', () => {
      const result = generateShaderColors(mockExtractedColors)
      
      // First color should be darkened version of dominant
      expect(result[0]).toBe('#4c0000') // #ff8040 darkened by 70%
      
      // Second color should be darkened version of first palette color
      expect(result[1]).toBe('#990000') // #ff0000 darkened by 40%
    })

    it('uses palette colors for remaining positions', () => {
      const result = generateShaderColors(mockExtractedColors)
      
      // Third color should be second palette color
      expect(result[2]).toBe('#00ff00')
      
      // Fourth color should be lightened third palette color
      expect(result[3]).toBe('#3333ff') // #0000ff lightened by 20%
    })

    it('falls back to dominant color when palette is incomplete', () => {
      const incompleteColors: ExtractedColors = {
        dominant: '#ff0000',
        palette: ['#00ff00'] // Only one palette color
      }

      const result = generateShaderColors(incompleteColors)
      
      expect(result).toHaveLength(4)
      // Should use dominant color as fallback for missing palette colors
      expect(result[2]).toBe('#ff0000') // palette[1] || dominant
      expect(result[3]).toBe('#ff3333') // palette[2] || dominant, lightened
    })

    it('handles edge case colors correctly', () => {
      const edgeColors: ExtractedColors = {
        dominant: '#000000', // Black
        palette: ['#ffffff', '#000000', '#ffffff', '#000000'] // High contrast
      }

      const result = generateShaderColors(edgeColors)
      
      expect(result).toHaveLength(4)
      // All results should be valid hex colors
      result.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('preserves color bounds (0-255) in calculations', () => {
      const brightColors: ExtractedColors = {
        dominant: '#ffffff', // White - test upper bounds
        palette: ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
      }

      const result = generateShaderColors(brightColors)
      
      // Should handle the bounds correctly without overflow
      expect(result).toHaveLength(4)
      result.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
        // Verify no invalid characters from overflow
        expect(color.slice(1)).not.toMatch(/[^0-9a-f]/i)
      })
    })
  })

  describe('helper functions', () => {
    describe('darkenColor', () => {
      it('darkens colors correctly', () => {
        const mockColors: ExtractedColors = {
          dominant: '#ff8040',
          palette: ['#ff0000', '#808080', '#ffffff', '#000000']
        }

        const result = generateShaderColors(mockColors)
        
        // Test that darkening produces darker colors
        // Note: We test indirectly through generateShaderColors since darkenColor is private
        expect(result[0]).not.toBe('#ff8040') // Should be different from original
        expect(result[1]).not.toBe('#ff0000') // Should be different from original
      })
    })

    describe('lightenColor', () => {
      it('lightens colors correctly', () => {
        const mockColors: ExtractedColors = {
          dominant: '#808080',
          palette: ['#404040', '#202020', '#404040', '#202020']
        }

        const result = generateShaderColors(mockColors)
        
        // Fourth color should be lightened version of third palette color
        expect(result[3]).not.toBe('#404040') // Should be different from original
      })
    })
  })
})