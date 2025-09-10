import { shimmer, toBase64, getImagePlaceholder, getResponsiveImageSizes } from '@/app/lib/utils/image'

describe('Image Utilities', () => {
  describe('shimmer', () => {
    it('generates SVG with correct dimensions', () => {
      const svg = shimmer(100, 200)
      
      expect(svg).toContain('width="100"')
      expect(svg).toContain('height="200"')
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
    })

    it('includes gradient animation elements', () => {
      const svg = shimmer(50, 50)
      
      expect(svg).toContain('<linearGradient')
      expect(svg).toContain('<animate')
      expect(svg).toContain('repeatCount="indefinite"')
    })
  })

  describe('toBase64', () => {
    it('converts string to base64 in Node.js environment', () => {
      const input = 'hello world'
      const result = toBase64(input)
      
      // Should return base64 encoded string
      expect(typeof result).toBe('string')
      expect(result).toBe(Buffer.from(input).toString('base64'))
    })

    it('handles empty string', () => {
      const result = toBase64('')
      expect(result).toBe('')
    })
  })

  describe('getImagePlaceholder', () => {
    it('returns data URL with base64 encoded SVG', () => {
      const placeholder = getImagePlaceholder(100, 100)
      
      expect(placeholder).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(typeof placeholder).toBe('string')
    })

    it('generates different placeholders for different dimensions', () => {
      const placeholder1 = getImagePlaceholder(100, 100)
      const placeholder2 = getImagePlaceholder(200, 200)
      
      expect(placeholder1).not.toBe(placeholder2)
    })
  })

  describe('getResponsiveImageSizes', () => {
    it('generates responsive sizes string with default breakpoints', () => {
      const sizes = getResponsiveImageSizes(300)
      
      expect(sizes).toContain('(min-width: 640px) 300px')
      expect(sizes).toContain('(min-width: 768px) 300px')
      expect(sizes).toContain('(min-width: 1024px) 300px')
      expect(sizes).toContain('(min-width: 1280px) 300px')
      expect(sizes).toMatch(/300px$/)
    })

    it('uses custom breakpoints when provided', () => {
      const customBreakpoints = {
        mobile: 480,
        tablet: 768,
      }
      const sizes = getResponsiveImageSizes(250, customBreakpoints)
      
      expect(sizes).toContain('(min-width: 480px) 250px')
      expect(sizes).toContain('(min-width: 768px) 250px')
      expect(sizes).toMatch(/250px$/)
    })

    it('handles single breakpoint', () => {
      const sizes = getResponsiveImageSizes(400, { lg: 1024 })
      
      expect(sizes).toBe('(min-width: 1024px) 400px, 400px')
    })

    it('handles empty breakpoints object', () => {
      const sizes = getResponsiveImageSizes(500, {})
      
      expect(sizes).toBe(', 500px')
    })
  })
})