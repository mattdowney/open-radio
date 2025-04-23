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
  const imageLoadedRef = useRef<boolean>(false);
  const albumColorsRef = useRef<Float32Array>(new Float32Array([0.5, 0.3, 0.7, 0.2, 0.5, 0.9]));
  
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!albumCoverUrl) {
      setIsReady(true);
      return;
    }
    
    setIsReady(false);
    
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      const [color1, color2] = extractColors(image);
      
      albumColorsRef.current = new Float32Array([
        ...color1, 
        ...color2
      ]);
      
      setIsReady(true);
    };
    
    image.onerror = () => {
      setIsReady(true);
    };
    
    image.src = albumCoverUrl;
  }, [albumCoverUrl]);

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
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform sampler2D u_texture;
    uniform float u_textureLoaded;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    varying vec2 v_uv;

    #define PI 3.14159265359

    float slowTime() {
      return u_time * 0.3;
    }

    vec3 palette(in float t) {
        vec3 a = vec3(0.55, 0.55, 0.55);
        vec3 b = vec3(0.45, 0.45, 0.45);
        vec3 c = vec3(1.0, 1.0, 1.0);
        
        vec3 d = mix(u_color1, u_color2, 0.3);
        
        vec3 col = a + b * cos(6.28318 * (c * t + d));
        
        float albumBrightness = dot(u_color1, vec3(0.299, 0.587, 0.114));
        col = mix(col, u_color1, smoothstep(0.3, 0.7, albumBrightness) * 0.4);
        
        return col;
    }

    float hash(float n) {
        return fract(sin(n) * 43758.5453);
    }

    float noise(vec2 p) {
        vec2 f = fract(p);
        p = floor(p);
        float v = p.x + p.y * 100.0;
        return mix(mix(hash(v), hash(v + 1.0), f.x),
                  mix(hash(v + 100.0), hash(v + 101.0), f.x), f.y);
    }

    float fbm(vec2 p) {
        float v = 0.0;
        v += noise(p * 1.0) * 0.5;
        v += noise(p * 2.0) * 0.25;
        v += noise(p * 4.0) * 0.125;
        return v;
    }

    vec2 rotate(vec2 uv, float angle) {
        return mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
    }

    vec3 albumGradient(float t) {
        vec3 gradient = mix(u_color1, u_color2, t);
        
        gradient = mix(gradient, palette(t * 0.7), 0.4);
        
        return gradient;
    }

    void main() {
        vec2 uv = v_uv - 0.5;
        uv.x *= u_resolution.x / u_resolution.y;
        
        vec2 mouse = u_mouse - 0.5;
        mouse.x *= u_resolution.x / u_resolution.y;
        float mouseDist = length(uv - mouse);
        float mouseInfluence = 0.0;
        
        float time = slowTime();
        
        float colorIntensity = length(u_color1) / 1.732;
        float distortionAmount = mix(0.01, 0.02, colorIntensity);
        
        uv += distortionAmount * sin(time * 0.7 + uv.yx * 10.0); 
        uv = rotate(uv, time * 0.12 + mouseInfluence * 0.3);
        
        float colorSaturation = max(max(u_color1.r, u_color1.g), u_color1.b) - 
                               min(min(u_color1.r, u_color1.g), u_color1.b);
        
        float waveFrequency = mix(4.0, 8.0, colorSaturation);
        float waveAmplitude = mix(0.05, 0.15, colorSaturation);
        
        float wave = sin(uv.x * waveFrequency + time * 1.0) * waveAmplitude;
        wave += sin(uv.y * (waveFrequency * 0.5) + time * 0.7) * waveAmplitude;
        uv.y += wave * (0.5 + 0.5 * sin(time * 0.3));
        
        float d = length(uv) * 2.0;
        
        vec3 col = palette(d + time * 0.15);
        
        float noiseScale = mix(3.0, 5.0, colorSaturation);
        float f1 = fbm(uv * noiseScale + time * 0.3);
        float f2 = fbm(uv * (noiseScale * 2.0) - time * 0.2);
        float f = f1 * 0.7 + f2 * 0.3;
        
        vec3 mixColor = albumGradient(f);
        
        col = mix(col, mixColor, 0.7);
        
        float cells = fbm(uv * 3.0 + fbm(uv * 6.0) * 2.0);
        col = mix(col, u_color2 * 1.2, smoothstep(0.4, 0.6, cells) * 0.3);
        
        float brightness = dot(u_color1, vec3(0.299, 0.587, 0.114));
        vec3 highlightColor = mix(u_color1, vec3(1.0), 0.3);
        
        float highlightIntensity = mix(0.15, 0.3, 1.0 - brightness);
        col += highlightColor * pow(abs(sin(d * PI * 3.0 - time)), 8.0) * highlightIntensity;
        
        float ringFrequency = mix(8.0, 12.0, colorSaturation);
        float rings = 0.5 + 0.5 * sin(d * ringFrequency - time);
        col += u_color1 * 0.15 * smoothstep(0.4, 0.6, rings);
        
        if (u_textureLoaded > 0.5) {
            float swirlIntensity = mix(0.3, 0.6, colorSaturation);
            float timeScale = mix(0.3, 0.5, brightness);
            
            vec2 swirl = vec2(
                sin(uv.y * 4.0 + time * timeScale + f1 * 2.0) * swirlIntensity,
                cos(uv.x * 4.0 + time * (timeScale * 1.2) + f2 * 2.0) * swirlIntensity
            );
            
            float displacement = fbm(uv * 2.0 + swirl + time * 0.1) * 0.4;
            col = mix(col, u_color1 * 1.3, displacement);
            
            float bands = fbm(vec2(d * 5.0, time * 0.2));
            col = mix(col, mix(u_color1, u_color2, bands) * 1.2, bands * 0.3);
        }
        
        float centerGlow = smoothstep(0.5, 0.0, length(uv)) * 0.3;
        col += mix(u_color1, vec3(1.0), 0.4) * centerGlow;
        
        float vignetteStrength = mix(0.2, 0.4, 1.0 - brightness);
        col *= 1.0 - smoothstep(0.0, 0.8, length(uv)) * vignetteStrength;
        
        gl_FragColor = vec4(col, 1.0);
    }
  `;

  const extractColors = (image: HTMLImageElement): [number[], number[]] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [[0.5, 0.3, 0.7], [0.2, 0.5, 0.9]];
    
    const width = Math.min(image.width, 300);
    const height = Math.min(image.height, 300);
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(image, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    interface ColorBin {
      r: number;
      g: number;
      b: number;
      count: number;
      key: string;
    }
    
    const colorBins: ColorBin[] = [];
    const maxColors = 100;
    let totalPixels = 0;
    let skippedPixels = 0;

    const stride = Math.max(1, Math.floor((width * height) / 10000));
    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const i = (y * width + x) * 4;
        
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        if (a < 200 || (r + g + b < 20) || (r > 250 && g > 250 && b > 250)) {
          skippedPixels++;
          continue;
        }
        
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        
        if (brightness < 0.08 || brightness > 0.95 || saturation < 0.1) {
          skippedPixels++;
          continue;
        }
        
        const quantLevel = 8;
        const quantR = Math.floor(r / 255 * quantLevel) * (255 / quantLevel);
        const quantG = Math.floor(g / 255 * quantLevel) * (255 / quantLevel);
        const quantB = Math.floor(b / 255 * quantLevel) * (255 / quantLevel);
        
        const colorKey = `${quantR},${quantG},${quantB}`;
        
        const existingBinIndex = colorBins.findIndex(bin => bin.key === colorKey);
        
        if (existingBinIndex !== -1) {
          const bin = colorBins[existingBinIndex];
          bin.count++;
          bin.r += r;
          bin.g += g;
          bin.b += b;
        } else {
          colorBins.push({ r, g, b, count: 1, key: colorKey });
          
          if (colorBins.length > maxColors) {
            let minCountIndex = 0;
            let minCount = colorBins[0].count;
            
            for (let i = 1; i < colorBins.length; i++) {
              if (colorBins[i].count < minCount) {
                minCount = colorBins[i].count;
                minCountIndex = i;
              }
            }
            
            colorBins.splice(minCountIndex, 1);
          }
        }
        
        totalPixels++;
      }
    }
    
    const weightedColors = colorBins.map(bin => {
      const { r, g, b, count } = bin;
      
      const avgR = r / count;
      const avgG = g / count;
      const avgB = b / count;
      
      const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114) / 255;
      const max = Math.max(avgR, avgG, avgB);
      const min = Math.min(avgR, avgG, avgB);
      const saturation = max === 0 ? 0 : (max - min) / max;
      
      let hue = 0;
      if (max !== min) {
        if (max === avgR) {
          hue = ((avgG - avgB) / (max - min) + (avgG < avgB ? 6 : 0)) / 6;
        } else if (max === avgG) {
          hue = ((avgB - avgR) / (max - min) + 2) / 6;
        } else {
          hue = ((avgR - avgG) / (max - min) + 4) / 6;
        }
      }
      
      const vibrance = saturation * 2 + (brightness > 0.5 ? brightness : 1 - brightness);
      
      return {
        r: avgR,
        g: avgG,
        b: avgB,
        count,
        brightness,
        saturation,
        hue,
        vibrance,
        normalized: [avgR / 255, avgG / 255, avgB / 255]
      };
    });
    
    const sortedColors = weightedColors.sort((a, b) => {
      const aScore = a.vibrance * Math.log(a.count + 1);
      const bScore = b.vibrance * Math.log(b.count + 1);
      return bScore - aScore;
    });
    
    if (sortedColors.length === 0) {
      return [[0.5, 0.3, 0.7], [0.2, 0.5, 0.9]];
    }
    
    const primaryColor = sortedColors[0].normalized;
    
    let secondaryColor: number[] = [];
    let bestContrastScore = -1;
    
    for (let i = 1; i < Math.min(sortedColors.length, 10); i++) {
      const candidate = sortedColors[i];
      
      const colorDiff = Math.abs(sortedColors[0].r - candidate.r) + 
                         Math.abs(sortedColors[0].g - candidate.g) +
                         Math.abs(sortedColors[0].b - candidate.b);
                         
      const brightnessDiff = Math.abs(sortedColors[0].brightness - candidate.brightness);
      const hueDiff = Math.min(
        Math.abs(sortedColors[0].hue - candidate.hue),
        1 - Math.abs(sortedColors[0].hue - candidate.hue)
      );
      
      const contrastScore = (colorDiff / 255) * 0.5 + brightnessDiff * 0.3 + hueDiff * 0.2 + candidate.vibrance * 0.1;
      
      if (contrastScore > bestContrastScore) {
        bestContrastScore = contrastScore;
        secondaryColor = candidate.normalized;
      }
    }
    
    if (bestContrastScore < 0.3 || secondaryColor.length === 0) {
      const complementaryHue = (sortedColors[0].hue + 0.5) % 1;
      
      let closestColor = sortedColors[0].normalized;
      let closestDist = 1;
      
      for (const color of sortedColors) {
        const hueDist = Math.min(
          Math.abs(color.hue - complementaryHue),
          1 - Math.abs(color.hue - complementaryHue)
        );
        
        if (hueDist < closestDist && color.vibrance > 0.5) {
          closestDist = hueDist;
          closestColor = color.normalized;
        }
      }
      
      if (closestDist > 0.25) {
        const r = primaryColor[0], g = primaryColor[1], b = primaryColor[2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          
          h /= 6;
        }
        
        h = (h + 0.5) % 1;
        
        const hToRgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        closestColor = [
          hToRgb(p, q, h + 1/3),
          hToRgb(p, q, h),
          hToRgb(p, q, h - 1/3)
        ];
      }
      
      secondaryColor = closestColor;
    }
    
    return [primaryColor, secondaryColor];
  };

  useEffect(() => {
    if (!isReady) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;
    
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    
    shaderProgramRef.current = program;

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const texture = gl.createTexture();
    textureRef.current = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    gl.texImage2D(
      gl.TEXTURE_2D, 
      0, 
      gl.RGBA, 
      1, 1, 
      0, 
      gl.RGBA, 
      gl.UNSIGNED_BYTE, 
      new Uint8Array([0, 0, 255, 255])
    );
    
    if (albumCoverUrl) {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      const color1Location = gl.getUniformLocation(program, 'u_color1');
      const color2Location = gl.getUniformLocation(program, 'u_color2');
      
      image.onload = () => {
        const success = initImageTexture(gl, texture, image, color1Location, color2Location);
        
        imageLoadedRef.current = success;
      };
      
      image.onerror = () => {
        if (albumColorsRef.current) {
          gl.uniform3f(color1Location, albumColorsRef.current[0], albumColorsRef.current[1], albumColorsRef.current[2]);
          gl.uniform3f(color2Location, albumColorsRef.current[3], albumColorsRef.current[4], albumColorsRef.current[5]);
        }
      };
      
      image.src = albumCoverUrl;
    }

    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const textureUniformLocation = gl.getUniformLocation(program, 'u_texture');
    const textureLoadedLocation = gl.getUniformLocation(program, 'u_textureLoaded');
    const color1Location = gl.getUniformLocation(program, 'u_color1');
    const color2Location = gl.getUniformLocation(program, 'u_color2');

    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    const render = () => {
      const now = Date.now();
      const time = (now - startTimeRef.current) / 1000;

      gl.useProgram(program);

      gl.uniform1f(timeUniformLocation, time);
      gl.uniform2f(mouseUniformLocation, mouseRef.current[0], mouseRef.current[1]);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.uniform1i(textureUniformLocation, 0);
      
      gl.uniform1f(textureLoadedLocation, imageLoadedRef.current ? 1.0 : 0.0);
      
      const colors = albumColorsRef.current;
      gl.uniform3f(color1Location, colors[0], colors[1], colors[2]);
      gl.uniform3f(color2Location, colors[3], colors[4], colors[5]);

      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, albumCoverUrl]);

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

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
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  };

  const initImageTexture = (
    gl: WebGLRenderingContext | null, 
    texture: WebGLTexture | null, 
    image: HTMLImageElement,
    color1Location: WebGLUniformLocation | null,
    color2Location: WebGLUniformLocation | null
  ): boolean => {
    if (!gl) {
      return false;
    }

    if (!texture) {
      return false;
    }

    try {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      if (color1Location && color2Location) {
        const colors = albumColorsRef.current;
        gl.uniform3f(color1Location, colors[0], colors[1], colors[2]);
        gl.uniform3f(color2Location, colors[3], colors[4], colors[5]);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  if (!isReady) {
    return <div className={`w-full h-full ${className || ''}`} style={{ background: '#000' }} />;
  }

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