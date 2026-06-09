import React from 'react';
import { Button } from '@games/ui';

interface ActionButtonsProps {
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  onAction: (action: string) => void;
}

export function ActionButtons({ canHit, canStand, canDouble, canSplit, canSurrender, onAction }: ActionButtonsProps) {
  return (
    <div className="bj-action-panel" style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '0.75rem',
      borderRadius: '12px',
      background: 'var(--surface-panel)',
      border: '1px solid var(--border-subtle)',
    }}>
      {canHit && (
        <Button size="sm" onClick={() => onAction('HIT')} style={{ minWidth: '80px' }}>
          Hit
        </Button>
      )}
      {canStand && (
        <Button size="sm" variant="secondary" onClick={() => onAction('STAND')} style={{ minWidth: '80px' }}>
          Stand
        </Button>
      )}
      {canDouble && (
        <Button size="sm" variant="secondary" onClick={() => onAction('DOUBLE')} style={{ minWidth: '80px' }}>
          Double
        </Button>
      )}
      {canSplit && (
        <Button size="sm" variant="secondary" onClick={() => onAction('SPLIT')} style={{ minWidth: '80px' }}>
          Split
        </Button>
      )}
      {canSurrender && (
        <Button size="sm" variant="ghost" onClick={() => onAction('SURRENDER')} style={{ minWidth: '80px' }}>
          Surrender
        </Button>
      )}
    </div>
  );
}
