import { useEffect, useRef, useState } from 'react';

interface ShaderBackgroundProps {
  className?: string;
  albumCoverUrl?: string;
}

const ShaderBackground = ({ className, albumCoverUrl }: ShaderBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shaderProgramRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const startTimeRef = useRef<number>(Date.now());
  const textureRef = useRef<WebGLTexture | null>(null);
  const prevTextureRef = useRef<WebGLTexture | null>(null);
  const imageLoadedRef = useRef<boolean>(false);
  const lastFrameTimeRef = useRef<number | null>(null);
  
  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionStartTimeRef = useRef<number>(0);
  const transitionDurationRef = useRef<number>(800); // 800ms transition
  const currentAlbumUrlRef = useRef<string>('');
  const previousAlbumUrlRef = useRef<string>('');
  
  const albumColorsRef = useRef<Float32Array>(new Float32Array([
    0.5, 0.3, 0.7, // color1 
    0.2, 0.5, 0.9, // color2
    0.3, 0.2, 0.8, // color3
    0.8, 0.2, 0.4, // color4
    0.4, 0.6, 0.3, // color5
    0.7, 0.7, 0.2, // color6
    0.9, 0.3, 0.5, // color7
    0.3, 0.5, 0.7  // color8
  ]));
  
  const prevAlbumColorsRef = useRef<Float32Array>(new Float32Array([
    0.5, 0.3, 0.7, // color1 
    0.2, 0.5, 0.9, // color2
    0.3, 0.2, 0.8, // color3
    0.8, 0.2, 0.4, // color4
    0.4, 0.6, 0.3, // color5
    0.7, 0.7, 0.2, // color6
    0.9, 0.3, 0.5, // color7
    0.3, 0.5, 0.7  // color8
  ]));

  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;

    void main() {
      gl_Position = vec4(a_position, 0, 1);
      v_uv = a_position * 0.5 + 0.5;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform sampler2D u_texture;
    uniform sampler2D u_prevTexture;
    uniform float u_textureLoaded;
    uniform float u_transitionProgress;
    
    // Enhanced color palette (8 colors) - current
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform vec3 u_color4;
    uniform vec3 u_color5;
    uniform vec3 u_color6;
    uniform vec3 u_color7;
    uniform vec3 u_color8;
    
    // Previous color palette (8 colors) - for transitions
    uniform vec3 u_prevColor1;
    uniform vec3 u_prevColor2;
    uniform vec3 u_prevColor3;
    uniform vec3 u_prevColor4;
    uniform vec3 u_prevColor5;
    uniform vec3 u_prevColor6;
    uniform vec3 u_prevColor7;
    uniform vec3 u_prevColor8;
    
    varying vec2 v_uv;

    #define PI 3.14159265359
    #define NUM_OCTAVES 5

    // Elegant smooth time
    float animTime() {
      return u_time * 0.3; // Slower, more graceful timing
    }

    // Improved noise functions for smoother, smoke-like effects
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    // Improved value noise with quintic interpolation for elegance
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      // Quintic interpolation for smoother, more elegant transitions
      vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
      
      // Four corners
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    // Fractal Brownian Motion - creates smoke-like patterns with elegance
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      // More octaves = more detail, but with elegant weighting
      for (int i = 0; i < NUM_OCTAVES; i++) {
        value += amplitude * noise(st * frequency);
        st = st * 1.1 + 0.12 * vec2(cos(u_time * 0.1), sin(u_time * 0.08)); // More graceful evolution
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return value;
    }

    // Refined flow function with more elegant, organic movement
    vec2 flow(vec2 st, float time, float intensity) {
      // Softer sinusoidal movements for elegance
      vec2 flowVector = vec2(
        sin(time * 0.2 + st.y * 2.5) * cos(time * 0.15) * 0.06 * intensity, 
        cos(time * 0.18 + st.x * 2.2) * sin(time * 0.13) * 0.06 * intensity
      );
      return st + flowVector;
    }

    // Enhanced warping function with more graceful movement
    vec2 warp(vec2 st, float time, float intensity) {
      // Create offset coordinates with gentler evolution
      vec2 q = vec2(
        fbm(st + vec2(0.0, 0.2) * time * 0.8),
        fbm(st + vec2(5.2, 1.3) * 0.6)
      );
      
      // Create second layer of distortion with measured elegance
      vec2 r = vec2(
        fbm(st + 3.5 * q + vec2(1.7, 9.2) + 0.15 * time * 0.9),
        fbm(st + 3.5 * q + vec2(8.3, 2.8) + 0.126 * time * 0.7)
      );
      
      // Combine distortions with refined intensity for organic elegance
      return st + (q * 0.5 + r * 0.5) * intensity;
    }

    // Refined color palette function
    vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
      return a + b * cos(6.28318 * (c * t + d));
    }

    // Smooth transition function with easing
    float easeInOutCubic(float t) {
      return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
    }

    void main() {
      vec2 uv = v_uv;
      vec2 centered = uv - 0.5;
      centered.x *= u_resolution.x / u_resolution.y;
      
      // Time - more graceful pacing
      float time = animTime();
      
      // Use constant intensity
      float baseIntensity = 0.6;
      
      // Apply warping with fixed intensity
      vec2 warpedUV = warp(centered * 1.4, time, baseIntensity);
      
      // Create flowing layers of smoke with more elegance
      float smokeLayer1 = fbm(warpedUV * 2.2 + time * 0.15);
      float smokeLayer2 = fbm(warpedUV * 3.5 - time * 0.17);
      float smokeLayer3 = fbm(warpedUV * 1.6 + fbm(warpedUV * 2.8) * 0.7); 
      
      // Create flowing movement with more elegant motion
      float flowSpeed = 0.8;
      vec2 flowUV1 = flow(centered, time * flowSpeed, baseIntensity);
      vec2 flowUV2 = flow(centered * 1.2, time * flowSpeed * 0.6, baseIntensity);
      
      float flowPattern1 = fbm(flowUV1 * 2.8 + fbm(flowUV1 * 5.0) * 0.5);
      float flowPattern2 = fbm(flowUV2 * 1.8 + fbm(flowUV2 * 3.5) * 0.4);
      
      // Combine smoke layers with constant mix factor
      float finalPattern = mix(
        smokeLayer1 * 0.35 + smokeLayer2 * 0.35 + smokeLayer3 * 0.3,
        flowPattern1 * 0.55 + flowPattern2 * 0.45,
        0.4
      );
      
      // Smooth transition progress with easing
      float transitionProgress = easeInOutCubic(clamp(u_transitionProgress, 0.0, 1.0));
      
      // Calculate current colors
      vec3 currentColor = vec3(0.0);
      
      // Create more elegant color parameters
      float t1 = finalPattern;
      float t2 = 1.0 - finalPattern;
      float t3 = sin(finalPattern * PI * 1.5 + time * 0.7) * 0.5 + 0.5;
      float t4 = smoothstep(0.2, 0.8, finalPattern + sin(centered.x * 2.5 + time * 0.5) * 0.15);
      float t5 = smoothstep(0.1, 0.9, fbm(centered * 1.8 + time * 0.2));
      float t6 = smoothstep(0.0, 1.0, sin(centered.y * 1.8 + time * 0.4) * 0.5 + 0.5);
      float t7 = fbm(centered * 2.8 + vec2(sin(time * 0.8), cos(time * 0.7)));
      float t8 = smoothstep(0.3, 0.7, length(centered) + sin(time * 0.6) * 0.15);
      
      // Current color palette
      currentColor = u_color1 * t1 * 0.85 +
                     u_color2 * t2 * 0.75 +
                     u_color3 * t3 * 0.65 +
                     u_color4 * t4 * 0.60;
                     
      currentColor += u_color5 * t5 * 0.50 +
                      u_color6 * t6 * 0.40 +
                      u_color7 * t7 * 0.35 +
                      u_color8 * t8 * 0.25;
      
      // Previous color palette (for smooth transitions)
      vec3 prevColor = u_prevColor1 * t1 * 0.85 +
                       u_prevColor2 * t2 * 0.75 +
                       u_prevColor3 * t3 * 0.65 +
                       u_prevColor4 * t4 * 0.60;
                       
      prevColor += u_prevColor5 * t5 * 0.50 +
                   u_prevColor6 * t6 * 0.40 +
                   u_prevColor7 * t7 * 0.35 +
                   u_prevColor8 * t8 * 0.25;
      
      // Blend between previous and current colors during transition
      vec3 color = mix(prevColor, currentColor, transitionProgress);
      
      // Normalize color intensity - softer overall look
      color *= 0.75;
              
      // Add depth with darker areas - more elegant shadows
      float depth = smoothstep(0.2, 0.8, fbm(warpedUV * 1.8 + time * 0.08));
      color = mix(color * 0.65, color, depth);
      
      // Refined center glow with subtle color variation
      float centerGlow = smoothstep(0.5, 0.0, length(centered)) * 0.25;
      vec3 glowColor = mix(
        mix(u_prevColor3, u_prevColor7, sin(time * 0.25) * 0.5 + 0.5),
        mix(u_color3, u_color7, sin(time * 0.25) * 0.5 + 0.5),
        transitionProgress
      );
      color += mix(glowColor, vec3(1.0), 0.2) * centerGlow;
      
      // Consistent vignette
      float vignetteStrength = 0.25;
      color *= 1.0 - smoothstep(0.0, 0.75, length(centered)) * vignetteStrength;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Expanded color extraction using advanced color clustering
  const extractDominantColors = (image: HTMLImageElement): number[][] => {
    console.log('Extracting expanded color palette from album artwork');
    
    // Create canvas for analysis
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return [
        [0.5, 0.3, 0.7], [0.2, 0.5, 0.9], [0.3, 0.2, 0.8], [0.8, 0.2, 0.4],
        [0.4, 0.6, 0.3], [0.7, 0.7, 0.2], [0.9, 0.3, 0.5], [0.3, 0.5, 0.7]
      ];
    }
    
    // Higher resolution for more accurate color sampling
    const size = 120;
    canvas.width = size;
    canvas.height = size;
    
    // Draw image to canvas
    ctx.drawImage(image, 0, 0, size, size);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    // Advanced color quantization with more detailed attributes
    // Step 1: Color reduction and enhanced binning
    const colorMap: Record<string, { 
      r: number, g: number, b: number, 
      count: number, 
      brightness: number, 
      saturation: number,
      hue: number,
      x: number, y: number // Position tracking for spatial awareness
    }> = {};
    
    const binSize = 6; // Smaller bin size for more variation
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip transparent pixels
        if (a < 127) continue;
        
        // Skip near-black and near-white (preserve more grays)
        const brightness = (r + g + b) / 3;
        if (brightness < 15 || brightness > 240) continue;
        
        // Calculate saturation
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const chroma = max - min;
        const saturation = max === 0 ? 0 : chroma / max;
        
        // Calculate hue (0-360)
        let hue = 0;
        if (chroma !== 0) {
          if (max === r) {
            hue = ((g - b) / chroma + 6) % 6;
          } else if (max === g) {
            hue = (b - r) / chroma + 2;
          } else {
            hue = (r - g) / chroma + 4;
          }
          hue *= 60;
        }
        
        // Create a binned color key with hue component for better grouping
        const binKey = `${Math.floor(r/binSize)},${Math.floor(g/binSize)},${Math.floor(b/binSize)}`;
        
        if (!colorMap[binKey]) {
          colorMap[binKey] = { 
            r, g, b, 
            count: 1,
            brightness,
            saturation,
            hue,
            x, y
          };
        } else {
          const bin = colorMap[binKey];
          // Weighted average to give more weight to pixels with higher saturation
          const weight = saturation > bin.saturation ? 1.2 : 1.0;
          const totalWeight = bin.count + weight;
          
          bin.r = (bin.r * bin.count + r * weight) / totalWeight;
          bin.g = (bin.g * bin.count + g * weight) / totalWeight;
          bin.b = (bin.b * bin.count + b * weight) / totalWeight;
          bin.brightness = (bin.brightness * bin.count + brightness * weight) / totalWeight;
          bin.saturation = (bin.saturation * bin.count + saturation * weight) / totalWeight;
          bin.hue = (bin.hue * bin.count + hue * weight) / totalWeight;
          bin.x = (bin.x * bin.count + x) / (bin.count + 1);
          bin.y = (bin.y * bin.count + y) / (bin.count + 1);
          bin.count += weight;
        }
      }
    }
    
    // Convert to array and apply more sophisticated filtering
    let colors = Object.values(colorMap);
    
    // More nuanced color categories for 8 distinct colors
    
    // 1. Vibrant colors - high saturation, good brightness
    const vibrantColors = colors
      .filter(c => c.saturation > 0.4 && c.brightness > 100 && c.brightness < 220)
      .sort((a, b) => (b.saturation * b.count) - (a.saturation * a.count));
    
    // 2. Muted colors - lower saturation, mid brightness
    const mutedColors = colors
      .filter(c => c.saturation < 0.4 && c.saturation > 0.1 && c.brightness > 60 && c.brightness < 180)
      .sort((a, b) => b.count - a.count);
    
    // 3. Dark vibrant colors - higher saturation, lower brightness
    const darkVibrantColors = colors
      .filter(c => c.saturation > 0.3 && c.brightness < 130 && c.brightness > 30)
      .sort((a, b) => (b.saturation * b.count) - (a.saturation * a.count));
    
    // 4. Dark muted colors - lower saturation, lower brightness
    const darkMutedColors = colors
      .filter(c => c.saturation < 0.3 && c.saturation > 0.1 && c.brightness < 130 && c.brightness > 30)
      .sort((a, b) => b.count - a.count);
    
    // 5. Light vibrant colors - higher saturation, higher brightness
    const lightVibrantColors = colors
      .filter(c => c.saturation > 0.3 && c.brightness > 180 && c.brightness < 240)
      .sort((a, b) => (b.saturation * b.count) - (a.saturation * a.count));
    
    // 6. Light muted colors - lower saturation, higher brightness
    const lightMutedColors = colors
      .filter(c => c.saturation < 0.3 && c.saturation > 0.1 && c.brightness > 180 && c.brightness < 240)
      .sort((a, b) => b.count - a.count);
    
    // 7. Dominant color - most frequent regardless of properties
    const dominantColors = [...colors].sort((a, b) => b.count - a.count);
    
    // 8. Accent color - high saturation but less common (for highlights)
    const accentColors = colors
      .filter(c => c.saturation > 0.5 && c.count < (dominantColors[0]?.count || 100) * 0.5)
      .sort((a, b) => b.saturation - a.saturation);
    
    // Extract most prominent from each category, with fallbacks
    const getColorFromCategory = (category: typeof vibrantColors, fallback: number[]) => {
      if (category.length > 0) {
        const color = category[0];
        return [color.r / 255, color.g / 255, color.b / 255];
      }
      return fallback;
    };
    
    // Sort all by count for fallbacks
    const allSorted = [...colors].sort((a, b) => b.count - a.count);
    
    // Default fallbacks with good variety
    const fallbacks = [
      [0.45, 0.35, 0.6], // Muted purple
      [0.35, 0.5, 0.45], // Muted teal
      [0.6, 0.45, 0.3],  // Muted orange
      [0.4, 0.4, 0.5],   // Muted blue-gray
      [0.5, 0.6, 0.3],   // Olive green
      [0.7, 0.6, 0.2],   // Gold
      [0.8, 0.3, 0.4],   // Raspberry
      [0.2, 0.4, 0.6]    // Steel blue
    ];
    
    // Prepare fallbacks from actual image when possible
    const universalFallbacks = allSorted.length > 0 
      ? [[allSorted[0].r / 255, allSorted[0].g / 255, allSorted[0].b / 255], ...fallbacks.slice(1)]
      : fallbacks;
    
    // Get 8 distinct colors
    const color1 = getColorFromCategory(vibrantColors, universalFallbacks[0]);
    const color2 = getColorFromCategory(mutedColors, universalFallbacks[1]);
    const color3 = getColorFromCategory(darkVibrantColors, universalFallbacks[2]);  
    const color4 = getColorFromCategory(darkMutedColors, universalFallbacks[3]);
    const color5 = getColorFromCategory(lightVibrantColors, universalFallbacks[4]);
    const color6 = getColorFromCategory(lightMutedColors, universalFallbacks[5]);
    const color7 = getColorFromCategory(dominantColors, universalFallbacks[6]);
    const color8 = getColorFromCategory(accentColors, universalFallbacks[7]);
    
    // Log the extracted colors for debugging
    console.log('Extracted expanded color palette:', { 
      vibrant: color1, 
      muted: color2, 
      darkVibrant: color3, 
      darkMuted: color4,
      lightVibrant: color5,
      lightMuted: color6,
      dominant: color7,
      accent: color8
    });
    
    return [color1, color2, color3, color4, color5, color6, color7, color8];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Create shader program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;
    
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    
    shaderProgramRef.current = program;

    // Set up position attribute
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create a rectangle that covers the entire canvas
    const positions = [
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create and set up the current texture
    textureRef.current = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
    
    // Fill with a placeholder until the image loads
    gl.texImage2D(
      gl.TEXTURE_2D, 
      0, 
      gl.RGBA, 
      1, 
      1, 
      0, 
      gl.RGBA, 
      gl.UNSIGNED_BYTE, 
      new Uint8Array([150, 100, 255, 255])
    );
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Create and set up the previous texture
    prevTextureRef.current = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, prevTextureRef.current);
    
    // Fill with the same placeholder
    gl.texImage2D(
      gl.TEXTURE_2D, 
      0, 
      gl.RGBA, 
      1, 
      1, 
      0, 
      gl.RGBA, 
      gl.UNSIGNED_BYTE, 
      new Uint8Array([150, 100, 255, 255])
    );
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Get uniform locations
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const textureUniformLocation = gl.getUniformLocation(program, 'u_texture');
    const prevTextureUniformLocation = gl.getUniformLocation(program, 'u_prevTexture');
    const textureLoadedLocation = gl.getUniformLocation(program, 'u_textureLoaded');
    const transitionProgressLocation = gl.getUniformLocation(program, 'u_transitionProgress');
    
    // Get current color uniform locations
    const color1Location = gl.getUniformLocation(program, 'u_color1');
    const color2Location = gl.getUniformLocation(program, 'u_color2');
    const color3Location = gl.getUniformLocation(program, 'u_color3');
    const color4Location = gl.getUniformLocation(program, 'u_color4');
    const color5Location = gl.getUniformLocation(program, 'u_color5');
    const color6Location = gl.getUniformLocation(program, 'u_color6');
    const color7Location = gl.getUniformLocation(program, 'u_color7');
    const color8Location = gl.getUniformLocation(program, 'u_color8');
    
    // Get previous color uniform locations
    const prevColor1Location = gl.getUniformLocation(program, 'u_prevColor1');
    const prevColor2Location = gl.getUniformLocation(program, 'u_prevColor2');
    const prevColor3Location = gl.getUniformLocation(program, 'u_prevColor3');
    const prevColor4Location = gl.getUniformLocation(program, 'u_prevColor4');
    const prevColor5Location = gl.getUniformLocation(program, 'u_prevColor5');
    const prevColor6Location = gl.getUniformLocation(program, 'u_prevColor6');
    const prevColor7Location = gl.getUniformLocation(program, 'u_prevColor7');
    const prevColor8Location = gl.getUniformLocation(program, 'u_prevColor8');

    // Set up resize handler
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };

    // Initial setup
    handleResize();
    window.addEventListener('resize', handleResize);

    // Render function with transition support
    const render = () => {
      const now = Date.now();
      const time = (now - startTimeRef.current) / 1000; // Time in seconds
      lastFrameTimeRef.current = time;

      gl.useProgram(program);

      // Calculate transition progress
      let transitionProgress = 1.0;
      if (isTransitioning && transitionStartTimeRef.current > 0) {
        const elapsed = now - transitionStartTimeRef.current;
        transitionProgress = Math.min(elapsed / transitionDurationRef.current, 1.0);
        
        // End transition when complete
        if (transitionProgress >= 1.0) {
          setIsTransitioning(false);
          transitionStartTimeRef.current = 0;
        }
      }

      // Update uniforms
      gl.uniform1f(timeUniformLocation, time);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(transitionProgressLocation, transitionProgress);
      
      // Activate and bind current texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.uniform1i(textureUniformLocation, 0);
      
      // Activate and bind previous texture
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, prevTextureRef.current);
      gl.uniform1i(prevTextureUniformLocation, 1);
      
      // Tell shader if texture is loaded
      gl.uniform1f(textureLoadedLocation, imageLoadedRef.current ? 1.0 : 0.0);
      
      // Pass current album colors to shader
      const colors = albumColorsRef.current;
      gl.uniform3f(color1Location, colors[0], colors[1], colors[2]);
      gl.uniform3f(color2Location, colors[3], colors[4], colors[5]);
      gl.uniform3f(color3Location, colors[6], colors[7], colors[8]);
      gl.uniform3f(color4Location, colors[9], colors[10], colors[11]);
      gl.uniform3f(color5Location, colors[12], colors[13], colors[14]);
      gl.uniform3f(color6Location, colors[15], colors[16], colors[17]);
      gl.uniform3f(color7Location, colors[18], colors[19], colors[20]);
      gl.uniform3f(color8Location, colors[21], colors[22], colors[23]);
      
      // Pass previous album colors to shader
      const prevColors = prevAlbumColorsRef.current;
      gl.uniform3f(prevColor1Location, prevColors[0], prevColors[1], prevColors[2]);
      gl.uniform3f(prevColor2Location, prevColors[3], prevColors[4], prevColors[5]);
      gl.uniform3f(prevColor3Location, prevColors[6], prevColors[7], prevColors[8]);
      gl.uniform3f(prevColor4Location, prevColors[9], prevColors[10], prevColors[11]);
      gl.uniform3f(prevColor5Location, prevColors[12], prevColors[13], prevColors[14]);
      gl.uniform3f(prevColor6Location, prevColors[15], prevColors[16], prevColors[17]);
      gl.uniform3f(prevColor7Location, prevColors[18], prevColors[19], prevColors[20]);
      gl.uniform3f(prevColor8Location, prevColors[21], prevColors[22], prevColors[23]);

      // Set up position attribute
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Start animation
    render();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTransitioning]);

  // Effect to load album cover as texture when albumCoverUrl changes
  useEffect(() => {
    if (!albumCoverUrl || !canvasRef.current) return;
    
    // Skip if this is the same URL as current
    if (albumCoverUrl === currentAlbumUrlRef.current) return;
    
    const gl = canvasRef.current.getContext('webgl');
    if (!gl || !textureRef.current || !prevTextureRef.current) return;
    
    console.log('Starting album cover transition:', {
      from: currentAlbumUrlRef.current,
      to: albumCoverUrl
    });
    
    // Store previous colors and load previous texture
    if (currentAlbumUrlRef.current) {
      // Copy current colors to previous colors
      prevAlbumColorsRef.current = new Float32Array(albumColorsRef.current);
      
      // Store the previous URL
      previousAlbumUrlRef.current = currentAlbumUrlRef.current;
      
      // Load the previous image into the previous texture
      const prevImage = new Image();
      prevImage.crossOrigin = 'anonymous';
      prevImage.onload = () => {
        if (!gl || !prevTextureRef.current) return;
        
        // Bind the previous texture
        gl.bindTexture(gl.TEXTURE_2D, prevTextureRef.current);
        
        // Upload the previous image into the previous texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, prevImage);
        
        console.log('Previous album artwork loaded for transition:', previousAlbumUrlRef.current);
      };
      prevImage.src = currentAlbumUrlRef.current;
    }
    
    // Start transition
    setIsTransitioning(true);
    transitionStartTimeRef.current = Date.now();
    
    // Reset texture loaded flag
    imageLoadedRef.current = false;
    
    // Create an image element to load the new album cover
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Needed for CORS
    
    image.onload = () => {
      if (!gl || !textureRef.current) return;
      
      console.log('New album artwork loaded successfully:', albumCoverUrl);
      
      // Bind the current texture
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      
      // Upload the new image into the current texture
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Extract expanded color palette (8 colors) from the new image
      const [color1, color2, color3, color4, color5, color6, color7, color8] = extractDominantColors(image);
      
      // Update the current colors ref with all 8 new colors
      albumColorsRef.current = new Float32Array([
        ...color1, // Vibrant
        ...color2, // Muted
        ...color3, // Dark vibrant
        ...color4, // Dark muted
        ...color5, // Light vibrant
        ...color6, // Light muted
        ...color7, // Dominant
        ...color8  // Accent
      ]);
      
      // Update current URL reference
      currentAlbumUrlRef.current = albumCoverUrl;
      
      // Set the loaded flag
      imageLoadedRef.current = true;
    };
    
    image.onerror = (e) => {
      console.error('Error loading album cover for shader:', e);
      imageLoadedRef.current = false;
      setIsTransitioning(false);
      transitionStartTimeRef.current = 0;
    };
    
    // Start loading the image
    image.src = albumCoverUrl;
    
    // Cleanup
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [albumCoverUrl]);

  // Helper function to create a shader
  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  // Helper function to create a program
  const createProgram = (
    gl: WebGLRenderingContext, 
    vertexShader: WebGLShader, 
    fragmentShader: WebGLShader
  ) => {
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  };

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ 
        display: 'block',
        touchAction: 'none'
      }}
    />
  );
};

export default ShaderBackground; 