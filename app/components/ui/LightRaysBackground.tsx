'use client';

import { useRef, useEffect, useState, forwardRef } from 'react';
import { Renderer, Program, Mesh, Geometry } from 'ogl';
import { cn } from '../../lib/utils';

export type RaysOrigin =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'right'
  | 'left'
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left';

export interface LightRaysBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
}

const DEFAULT_COLOR = '#00BCD4'; // Ocean cyan for our theme

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [0, 0.7, 0.83]; // Default ocean cyan
};

const getAnchorAndDir = (
  origin: RaysOrigin,
  w: number,
  h: number
): { anchor: [number, number]; dir: [number, number] } => {
  const outside = 0.2;
  switch (origin) {
    case 'top-left':
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case 'top-right':
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case 'right':
      return { anchor: [w + outside * w, h * 0.5], dir: [-1, 0] };
    case 'left':
      return { anchor: [-outside * w, h * 0.5], dir: [1, 0] };
    case 'bottom-center':
      return { anchor: [w * 0.5, h + outside * h], dir: [0, -1] };
    case 'bottom-right':
      return { anchor: [w, h + outside * h], dir: [0, -1] };
    case 'bottom-left':
      return { anchor: [0, h + outside * h], dir: [0, -1] };
    default: // "top-center"
      return { anchor: [w * 0.5, -outside * h], dir: [0, 1] };
  }
};

// Vertex shader
const vertex = `
  attribute vec2 position;
  varying vec2 vUv;
  
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment shader with god rays effect
const fragment = `
  precision highp float;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uRaysColor;
  uniform vec2 uAnchor;
  uniform vec2 uDirection;
  uniform float uLightSpread;
  uniform float uRayLength;
  uniform bool uPulsating;
  uniform float uFadeDistance;
  uniform float uSaturation;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;
  uniform float uNoiseAmount;
  uniform float uDistortion;
  
  varying vec2 vUv;
  
  float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    vec2 anchor = uAnchor / uResolution.xy;
    vec2 direction = normalize(uDirection);
    
    // Add mouse influence
    vec2 mousePos = uMouse / uResolution.xy;
    vec2 mouseDir = normalize(mousePos - anchor);
    direction = mix(direction, mouseDir, uMouseInfluence);
    
    // Calculate distance from anchor
    vec2 toPixel = st - anchor;
    float dist = length(toPixel);
    
    // Project pixel onto ray direction
    float projection = dot(normalize(toPixel), direction);
    
    // Calculate ray strength based on alignment with direction
    float rayStrength = max(0.0, projection);
    
    // Add perpendicular falloff for ray width
    vec2 perpendicular = vec2(-direction.y, direction.x);
    float perpDist = abs(dot(toPixel, perpendicular));
    float rayWidth = 1.0 / (1.0 + perpDist * uLightSpread * 20.0);
    
    // Distance-based fade
    float distanceFade = 1.0 / (1.0 + dist * uFadeDistance * 5.0);
    
    // Add noise for organic variation
    float noiseValue = smoothNoise(st * 10.0 + uTime * 0.5);
    float noiseInfluence = mix(1.0, noiseValue, uNoiseAmount);
    
    // Add distortion with sine waves
    float distortionValue = sin(st.y * 20.0 + uTime * 2.0) * uDistortion * 0.1;
    rayWidth *= (1.0 + distortionValue);
    
    // Pulsating effect
    float pulse = uPulsating ? (0.5 + 0.5 * sin(uTime * 3.0)) : 1.0;
    
    // Combine all effects
    float finalIntensity = rayStrength * rayWidth * distanceFade * noiseInfluence * pulse;
    finalIntensity = pow(finalIntensity * uRayLength, 0.8); // Gamma correction
    
    // Apply color and saturation
    vec3 color = uRaysColor * finalIntensity;
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, uSaturation);
    
    gl_FragColor = vec4(color, finalIntensity);
  }
`;

export const LightRaysBackground = forwardRef<HTMLDivElement, LightRaysBackgroundProps>(
  (
    {
      className,
      raysOrigin = 'top-center',
      raysColor = DEFAULT_COLOR,
      raysSpeed = 1,
      lightSpread = 1,
      rayLength = 2,
      pulsating = false,
      fadeDistance = 1.0,
      saturation = 1.0,
      followMouse = true,
      mouseInfluence = 0.1,
      noiseAmount = 0.0,
      distortion = 0.0,
      ...props
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const programRef = useRef<Program | null>(null);
    const meshRef = useRef<Mesh | null>(null);
    const animationFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());
    const [mousePos, setMousePos] = useState<[number, number]>([0, 0]);
    const [isVisible, setIsVisible] = useState(false);

    // Mouse tracking
    useEffect(() => {
      if (!followMouse) return;

      const handleMouseMove = (event: MouseEvent) => {
        setMousePos([event.clientX, event.clientY]);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [followMouse]);

    // Intersection Observer for performance
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
        threshold: 0.1,
      });

      observer.observe(canvas);
      return () => observer.disconnect();
    }, []);

    // WebGL initialization and render loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !isVisible) return;

      // Get proper dimensions immediately
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Set canvas buffer dimensions before creating renderer
      canvas.width = width * Math.min(window.devicePixelRatio, 2);
      canvas.height = height * Math.min(window.devicePixelRatio, 2);

      // Initialize renderer with proper sizing
      const renderer = new Renderer({
        canvas,
        alpha: true,
        width: width,
        height: height,
        dpr: Math.min(window.devicePixelRatio, 2),
      });
      rendererRef.current = renderer;

      const { gl } = renderer;

      // Calculate initial anchor and direction using physical pixel dimensions
      const { anchor, dir } = getAnchorAndDir(raysOrigin, canvas.width, canvas.height);

      // Create program
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [canvas.width, canvas.height] },
          uRaysColor: { value: hexToRgb(raysColor) },
          uAnchor: { value: anchor },
          uDirection: { value: dir },
          uLightSpread: { value: lightSpread },
          uRayLength: { value: rayLength },
          uPulsating: { value: pulsating },
          uFadeDistance: { value: fadeDistance },
          uSaturation: { value: saturation },
          uMouse: { value: mousePos },
          uMouseInfluence: { value: mouseInfluence },
          uNoiseAmount: { value: noiseAmount },
          uDistortion: { value: distortion },
        },
      });
      programRef.current = program;

      // Create full-screen quad geometry using OGL syntax
      const geometry = new Geometry(gl, {
        position: {
          size: 2,
          data: new Float32Array([
            -1,
            -1, // bottom left
            1,
            -1, // bottom right
            -1,
            1, // top left
            -1,
            1, // top left (repeat for second triangle)
            1,
            -1, // bottom right (repeat for second triangle)
            1,
            1, // top right
          ]),
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      // Resize handler
      const handleResize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio, 2);

        // Set canvas buffer dimensions (physical pixels)
        canvas.width = newWidth * dpr;
        canvas.height = newHeight * dpr;

        // Update WebGL viewport to match buffer dimensions
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Update renderer with logical dimensions
        renderer.setSize(newWidth, newHeight);

        const { anchor, dir } = getAnchorAndDir(raysOrigin, canvas.width, canvas.height);
        console.log(
          'Debug - Physical:',
          canvas.width,
          'x',
          canvas.height,
          'Anchor:',
          anchor,
          'Expected center X:',
          canvas.width * 0.5
        );

        // Use logical dimensions for shader uniforms
        program.uniforms.uResolution.value = [canvas.width, canvas.height];
        program.uniforms.uAnchor.value = anchor;
        program.uniforms.uDirection.value = dir;
      };

      // Set up resize listener for future changes
      window.addEventListener('resize', handleResize);

      // Render loop
      const render = () => {
        if (!isVisible) {
          animationFrameRef.current = requestAnimationFrame(render);
          return;
        }

        const time = (Date.now() - startTimeRef.current) * 0.001 * raysSpeed;
        program.uniforms.uTime.value = time;
        program.uniforms.uMouse.value = mousePos;
        program.uniforms.uRaysColor.value = hexToRgb(raysColor);

        renderer.render({ scene: mesh });
        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [
      isVisible,
      raysOrigin,
      raysColor,
      raysSpeed,
      lightSpread,
      rayLength,
      pulsating,
      fadeDistance,
      saturation,
      mousePos,
      mouseInfluence,
      noiseAmount,
      distortion,
    ]);

    return (
      <div ref={ref} className={cn('w-full h-full relative', className)} {...props}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            display: 'block',
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }
);

LightRaysBackground.displayName = 'LightRaysBackground';
