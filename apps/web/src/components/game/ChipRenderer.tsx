import React from 'react';

interface ChipRendererProps {
  value: number;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const CHIP_STYLES: Record<number, { bg: string; border: string; label: string }> = {
  1: { bg: '#ffffff', border: '#999', label: '1' },
  5: { bg: '#c45a5a', border: '#9a3a3a', label: '5' },
  10: { bg: '#4a7abd', border: '#3a5a8a', label: '10' },
  25: { bg: '#5a9e6e', border: '#3a7a4e', label: '25' },
  50: { bg: '#c4a040', border: '#9a7a30', label: '50' },
  100: { bg: '#2c2c30', border: '#1a1a1d', label: '100' },
  500: { bg: '#7a3a8a', border: '#5a2a6a', label: '500' },
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
        color: value >= 100 ? '#fff' : '#2B2926',
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
