'use client';

import { Theme } from '../../contexts/ThemeContext';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface AccessibilityBadgeProps {
  theme: Theme;
  className?: string;
}

export function AccessibilityBadge({ theme, className = '' }: AccessibilityBadgeProps) {
  const contrastRatio = calculateContrastRatio(theme.colors.text, theme.colors.background);
  const level = getWCAGLevel(contrastRatio);

  const badgeConfig = {
    AAA: {
      icon: ShieldCheck,
      color: '#10B981', // green-500
      label: 'AAA',
      title: 'Excellent accessibility (WCAG AAA)',
    },
    AA: {
      icon: Shield,
      color: '#F59E0B', // amber-500
      label: 'AA',
      title: 'Good accessibility (WCAG AA)',
    },
    FAIL: {
      icon: ShieldAlert,
      color: '#EF4444', // red-500
      label: 'Low',
      title: 'Below accessibility standards',
    },
  };

  const config = badgeConfig[level];
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
      }}
      title={`${config.title} (${contrastRatio.toFixed(1)}:1 contrast ratio)`}
    >
      <IconComponent size={10} />
      <span>{config.label}</span>
    </div>
  );
}

// Calculate WCAG contrast ratio between two colors
function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Convert to linear RGB
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  // Ensure l1 is the lighter color
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Determine WCAG compliance level
function getWCAGLevel(contrastRatio: number): 'AAA' | 'AA' | 'FAIL' {
  if (contrastRatio >= 7) return 'AAA'; // WCAG AAA for normal text
  if (contrastRatio >= 4.5) return 'AA'; // WCAG AA for normal text
  return 'FAIL';
}
