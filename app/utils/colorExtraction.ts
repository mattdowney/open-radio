import ColorThief from 'colorthief';

export interface ExtractedColors {
  dominant: string;
  palette: string[];
}

export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
  return new Promise((resolve, reject) => {
    const colorThief = new ColorThief();
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const dominantColor = colorThief.getColor(img);
        const palette = colorThief.getPalette(img, 4);
        
        const rgbToHex = (r: number, g: number, b: number) => 
          `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        
        resolve({
          dominant: rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]),
          palette: palette.map(color => rgbToHex(color[0], color[1], color[2]))
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for color extraction'));
    };
    
    img.src = imageUrl;
  });
}

export function generateShaderColors(extractedColors: ExtractedColors): string[] {
  const { dominant, palette } = extractedColors;
  
  const darkenColor = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };
  
  const lightenColor = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };
  
  return [
    darkenColor(dominant, 70),
    darkenColor(palette[0] || dominant, 40),
    palette[1] || dominant,
    lightenColor(palette[2] || dominant, 20)
  ];
}