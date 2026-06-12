import React from 'react';

interface ChipRendererProps {
  value: number;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const CHIP_STYLES: Record<number, { bg: string; border: string; label: string; text: string; shadow: string }> = {
  1: { bg: 'var(--chip-1-bg)', border: 'var(--chip-1-border)', text: 'var(--chip-1-text)', shadow: 'var(--chip-1-text-outline-shadow)', label: '1' },
  5: { bg: 'var(--chip-5-bg)', border: 'var(--chip-5-border)', text: 'var(--chip-5-text)', shadow: 'var(--chip-5-text-outline-shadow)', label: '5' },
  10: { bg: 'var(--chip-100-bg)', border: 'var(--chip-100-border)', text: 'var(--chip-100-text)', shadow: 'var(--chip-100-text-outline-shadow)', label: '10' },
  25: { bg: 'var(--chip-25-bg)', border: 'var(--chip-25-border)', text: 'var(--chip-25-text)', shadow: 'var(--chip-25-text-outline-shadow)', label: '25' },
  50: { bg: 'var(--chip-500-bg)', border: 'var(--chip-500-border)', text: 'var(--chip-500-text)', shadow: 'var(--chip-500-text-outline-shadow)', label: '50' },
  100: { bg: 'var(--chip-100-bg)', border: 'var(--chip-100-border)', text: 'var(--chip-100-text)', shadow: 'var(--chip-100-text-outline-shadow)', label: '100' },
  500: { bg: 'var(--chip-500-bg)', border: 'var(--chip-500-border)', text: 'var(--chip-500-text)', shadow: 'var(--chip-500-text-outline-shadow)', label: '500' },
};

function getChipStyle(value: number) {
  if (value >= 500) return CHIP_STYLES[500];
  if (value >= 100) return CHIP_STYLES[100];
  if (value >= 50) return CHIP_STYLES[50];
  if (value >= 25) return CHIP_STYLES[25];
  if (value >= 10) return CHIP_STYLES[10];
  if (value >= 5) return CHIP_STYLES[5];
  return CHIP_STYLES[1];
}

export function ChipRenderer({ value, size = 'md', style }: ChipRendererProps) {
  const chip = getChipStyle(value);
  const dim = size === 'sm' ? 32 : 44;

  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: chip.bg,
        border: `3px dashed ${chip.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'sm' ? '0.625rem' : '0.75rem',
        fontWeight: 700,
        color: chip.text,
        textShadow: chip.shadow,
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        flexShrink: 0,
        ...style,
      }}
    >
      {chip.label}
    </div>
  );
}
