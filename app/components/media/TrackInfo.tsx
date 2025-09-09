import { useEffect, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { cn } from '../../lib/utils';

interface TrackInfoProps {
  title: string;
  className?: string;
  bgColor?: string;
  'data-group-hover-bg-color'?: string;
  animateOnHover?: boolean;
}

function cleanTitle(str: string): string {
  return str
    .replace(/[\(\[\{].*?[\)\]\}]/g, '') // Remove anything in parentheses, brackets, or braces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
}

function toTitleCase(str: string): string {
  return cleanTitle(str)
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function TrackInfo({
  title,
  className,
  bgColor = 'black',
  'data-group-hover-bg-color': groupHoverBgColor,
  animateOnHover = false,
}: TrackInfoProps) {
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const formattedTitle = toTitleCase(title);

  // Reset animation state when title changes
  useEffect(() => {
    setShouldAnimate(false);
  }, [title]);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const needsAnimation =
          textRef.current.scrollWidth > containerRef.current.clientWidth;
        setNeedsMarquee(needsAnimation);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  // Handle hover state changes
  useEffect(() => {
    if (isHovered && needsMarquee && animateOnHover) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Reset animation state first
      setShouldAnimate(false);
      // Set a new timeout for the delay
      timeoutRef.current = setTimeout(() => {
        setShouldAnimate(true);
      }, 500); // 500ms delay
    } else {
      // Clear timeout and stop animation when not hovered
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShouldAnimate(false);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered, needsMarquee, animateOnHover]);

  const textStyles = 'text-sm text-white tracking-wide leading-5';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        'after:absolute after:right-0 after:top-0 after:h-full after:w-8',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        {
          '--fade-color': bgColor,
          '--hover-fade-color': groupHoverBgColor,
        } as React.CSSProperties
      }
    >
      {/* Gradient overlays */}
      <div
        className="absolute right-0 top-0 h-full w-8 z-10 transition-[background] duration-200"
        style={{
          background: `linear-gradient(to right, transparent, var(--fade-color, ${bgColor}) 40%, var(--fade-color, ${bgColor}))`,
        }}
      />
      {groupHoverBgColor && (
        <div
          className="absolute right-0 top-0 h-full w-8 z-10 opacity-0 group-hover:opacity-100 transition-[opacity,background] duration-200"
          style={{
            background: `linear-gradient(to right, transparent, var(--hover-fade-color, ${groupHoverBgColor}) 40%, var(--hover-fade-color, ${groupHoverBgColor}))`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-0">
        {/* Base truncated text */}
        <div
          ref={textRef}
          className={cn(
            textStyles,
            'truncate transition-opacity duration-200 font-normal',
            needsMarquee && shouldAnimate ? 'opacity-0' : 'opacity-100',
          )}
        >
          {formattedTitle}
        </div>

        {/* Marquee overlay */}
        {needsMarquee && shouldAnimate && (
          <div
            className={cn(
              'absolute inset-0 transition-all duration-200',
              'opacity-100 translate-x-0',
            )}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <Marquee
              gradient={false}
              speed={40}
              delay={0}
              className={textStyles}
              play={true}
            >
              <span className="pr-8">{formattedTitle}</span>
            </Marquee>
          </div>
        )}
      </div>
    </div>
  );
}
