import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ThemeToggle } from '@games/ui';
import { DealerArea } from '../components/game/DealerArea.js';
import { HandArea } from '../components/game/HandArea.js';
import { ActionButtons } from '../components/game/ActionButtons.js';
import { BetControls } from '../components/game/BetControls.js';
import { CardRenderer } from '../components/game/CardRenderer.js';
import { DeckStack } from '../components/game/DeckStack.js';
import { DeckSelector } from '../components/lobby/DeckSelector.js';
import { clearRoom } from '../lib/gameContext.js';
import { handValue } from '@blackjack/game-core';

interface GameScreenProps {
  room: any;
  mySessionId: string;
  roomCode: string;
}

export function GameScreen({ room, mySessionId, roomCode }: GameScreenProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<any>(null);
  const [turnInfo, setTurnInfo] = useState<any>(null);
  const [roundResult, setRoundResult] = useState<any>(null);
  const [bankrollOverride, setBankrollOverride] = useState<number | null>(null);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [lastBet, setLastBet] = useState<number | null>(null);

  useEffect(() => {
    if (!room) return;

    // Read current state immediately
    if (room.state) {
      const s = room.state;
      const plain: any = {};
      for (const key of Object.keys(s)) {
        const val = s[key];
        if (val && typeof val === 'object' && typeof val.values === 'function') {
          plain[key] = Array.from(val.values());
        } else if (val && typeof val === 'object' && typeof val[Symbol.iterator] === 'function' && !Array.isArray(val)) {
          plain[key] = Array.from(val);
        } else {
          plain[key] = val;
        }
      }
      setState(plain);
    }

    const onStateChange = (s: any) => {
      const plain: any = {};
      for (const key of Object.keys(s)) {
        const val = s[key];
        if (val && typeof val === 'object' && typeof val.values === 'function') {
          plain[key] = Array.from(val.values());
        } else if (val && typeof val === 'object' && typeof val[Symbol.iterator] === 'function' && !Array.isArray(val)) {
          plain[key] = Array.from(val);
        } else {
          plain[key] = val;
        }
      }
      setState(plain);
    };
    room.onStateChange(onStateChange);

    const onYourTurn = (data: any) => {
      turnInfoRef.current = data;
      setTurnInfo(data);
    };
    const onPlaceBet = () => {
      // Server says it's time to bet — just ensure we show bet controls
      // (the phase state already handles this, but this is a backup)
    };
    const onRoundResult = (data: any) => {
      setRoundResult(data);
      // Use bankroll from result message to avoid race condition with state sync
      if (data.bankrolls && room) {
        const myBankroll = data.bankrolls[room.sessionId];
        if (myBankroll !== undefined) {
          setBankrollOverride(myBankroll);
        }
      }
    };

    room.onMessage('your-turn', onYourTurn);
    room.onMessage('place-your-bet', onPlaceBet);
    room.onMessage('round-result', onRoundResult);
    room.onMessage('shuffling', () => {});

    return () => {
      room.onStateChange.remove(onStateChange);
    };
  }, [room]);

  // Derive turn state directly from server-synced state (like Mahjong game does).
  // The 'your-turn' message provides action capabilities (canHit, canDouble, etc.),
  // but isMyTurn is derived purely from state to avoid race conditions with React effects.
  const activeSeat = state?.activeSeat ?? 255;
  const activeHandIndex = state?.activeHandIndex ?? 0;
  const currentPhase = state?.phase || 'LOBBY';

  const players: any[] = state?.players || [];
  const mySeatIndex: number | undefined = players.find(
    (p: any) => p.playerId === mySessionId
  )?.seatIndex;

  const isMyTurn = currentPhase === 'PLAYER_TURN' && activeSeat !== 255 && activeSeat === mySeatIndex;

  // Use a ref so the 'your-turn' message handler can update without being clobbered
  // by effects. We also derive turnInfo from the state when it's our turn but
  // turnInfo hasn't been set yet (e.g., after a hot reload or reconnect).
  const turnInfoRef = useRef<any>(null);
  useEffect(() => {
    if (isMyTurn && !turnInfoRef.current) {
      // Derive turnInfo from state if 'your-turn' message was missed
      const myPlayer = players.find((p: any) => p.playerId === mySessionId);
      const myHands: any[] = myPlayer?.hands || [];
      const activeHand = myHands[activeHandIndex];
      if (activeHand) {
        const derived = {
          seat: activeSeat,
          handIndex: activeHandIndex,
          canHit: activeHand.status === 'playing',
          canStand: activeHand.status === 'playing',
          canDouble: activeHand.status === 'playing' && activeHand.cards?.length === 2,
          canSplit: false,
          canSurrender: false,
        };
        turnInfoRef.current = derived;
        setTurnInfo(derived);
      }
    } else if (!isMyTurn) {
      turnInfoRef.current = null;
      setTurnInfo(null);
    }
  }, [isMyTurn, activeSeat, activeHandIndex, mySeatIndex]);

  // Clear round result on new betting phase
  const prevPhaseRef = useRef<string>(currentPhase);
  useEffect(() => {
    if (currentPhase === 'BETTING' && prevPhaseRef.current !== 'BETTING') {
      setRoundResult(null);
      setBankrollOverride(null);
    }
    prevPhaseRef.current = currentPhase;
  }, [currentPhase]);

  const handlePlaceBet = useCallback((amount: number) => {
    setLastBet(amount);
    room?.send('place-bet', { amount });
  }, [room]);

  const handleAction = useCallback((action: string) => {
    room?.send('player-action', { action });
    turnInfoRef.current = null;
    setTurnInfo(null);
  }, [room]);

  const handleNextHand = useCallback(() => {
    // Host starts the next round — don't clear client state here;
    // the phase transition to BETTING will clear stale state naturally
    room?.send('start-round');
  }, [room]);

  const handleLeave = () => {
    try { room?.leave(); } catch {}
    clearRoom();
    navigate('/');
  };

  if (!state) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-table)' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>Connecting...</div>
      </div>
    );
  }

  const myPlayer = players.find((p: any) => p.playerId === mySessionId);
  const myHands: any[] = myPlayer?.hands || [];
  const dealerCards: any[] = state.dealerCards || [];
  const dealerStatus: string = state.dealerStatus || 'waiting';
  const effectiveBankroll = bankrollOverride ?? (myPlayer?.bankroll || 1000);
  const myRoundResults = roundResult?.results?.filter((r: any) => r.seat === myPlayer?.seatIndex) || [];
  const myRoundNet = myRoundResults.reduce((sum: number, r: any) => sum + (r.payout || 0), 0);

  const showShuffling = currentPhase === 'SHUFFLING';
  const showBetControls = currentPhase === 'BETTING' && !myPlayer?.hasBet;
  const showWaitingForBet = currentPhase === 'BETTING' && myPlayer?.hasBet;
  const showActions = currentPhase === 'PLAYER_TURN' && isMyTurn;
  const showWaitingForTurn = currentPhase === 'PLAYER_TURN' && !isMyTurn;
  const showDealerTurn = currentPhase === 'DEALER_TURN';
  const showDealing = currentPhase === 'DEALING';
  const showResult = currentPhase === 'ROUND_END' && roundResult;
  const showWaitingForResult = currentPhase === 'SETTLEMENT';

  return (
    <div className="bj-game-root" style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-table)',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div className="bj-topbar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        background: 'rgba(0,0,0,0.2)',
        flexShrink: 0,
      }}>
        <Button variant="ghost" onClick={handleLeave} style={{ color: 'rgba(255,255,255,0.7)' }}>
          &larr; Leave
        </Button>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.875rem',
        }}>
          {roomCode}
        </div>
        <ThemeToggle />
        <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.3)', position: 'absolute', bottom: '0.25rem', right: '0.5rem' }}>v1.0.1</span>
      </div>

      {/* Table area */}
      <div className="bj-table-stage" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        minHeight: 0,
        overflow: 'auto',
        position: 'relative',
      }}>
        {/* Deck visual indicator */}
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          zIndex: 10,
        }}>
          <div
            onClick={() => myPlayer?.isHost && setShowDeckSelector(!showDeckSelector)}
            style={{ cursor: myPlayer?.isHost ? 'pointer' : 'default', position: 'relative' }}
            title={myPlayer?.isHost ? 'Click to change deck count (applies next round)' : `${state.numDecks} ${state.numDecks === 1 ? 'Deck' : 'Decks'}`}
          >
            <DeckStack numDecks={state.numDecks ?? 2} />
          </div>

          {/* Deck selector popover for host */}
          {showDeckSelector && myPlayer?.isHost && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: 'var(--surface-card)',
              borderRadius: '12px',
              padding: '0.75rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 20,
            }}>
              <div style={{
                fontSize: '0.625rem',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.5rem',
              }}>
                Changes apply next round
              </div>
              <DeckSelector
                numDecks={state.numDecks ?? 2}
                isHost={true}
                onChange={(numDecks) => {
                  room?.send('change-decks', { numDecks });
                  setShowDeckSelector(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Dealer */}
        <DealerArea
          cards={dealerCards}
          status={dealerStatus}
        />

        {/* Other players (compact) */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '600px',
        }}>
          {players.filter((p: any) => p.playerId !== mySessionId).map((player: any) => {
            const hands: any[] = player.hands || [];
            return (
              <div key={player.playerId} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.375rem 0.5rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                minWidth: '80px',
              }}>
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {player.displayName}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {hands.length > 0 ? hands.map((hand: any, i: number) => {
                    const handCards: any[] = hand.cards || [];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
                        <div style={{ display: 'flex', gap: '-4px' }}>
                          {handCards.slice(0, 2).map((card: any, ci: number) => (
                            <div key={card.id} style={{ marginLeft: ci > 0 ? '-8px' : 0, zIndex: ci }}>
                              <CardRenderer suit={card.suit} rank={card.rank} size="sm" />
                            </div>
                          ))}
                        </div>
                        {hand.bet > 0 && (
                          <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>
                            ${hand.bet}
                          </div>
                        )}
                      </div>
                    );
                  }) : player.hasBet && player.currentBet > 0 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 56,
                      borderRadius: '4px',
                      border: '1px dashed rgba(255,255,255,0.2)',
                      fontSize: '0.625rem',
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 600,
                    }}>
                      ${player.currentBet}
                    </div>
                  ) : (
                    <div style={{
                      width: 40,
                      height: 56,
                      borderRadius: '4px',
                      border: '1px dashed rgba(255,255,255,0.2)',
                    }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* My hands */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {myHands.length > 0 ? myHands.map((hand: any, i: number) => {
            const myCards: any[] = hand.cards || [];
            return (
              <HandArea
                key={i}
                cards={myCards}
                bet={hand.bet}
                status={hand.status}
                isActive={isMyTurn && turnInfo?.handIndex === i}
                showCards={true}
                label={myHands.length > 1 ? `Hand ${i + 1}` : undefined}
              />
            );
          }) : (
            <div style={{
              padding: '2rem',
              borderRadius: '12px',
              border: '2px dashed rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.875rem',
            }}>
              {currentPhase === 'LOBBY' ? 'Waiting for game to start...' : 'Waiting for cards...'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom action area */}
      <div className="bj-action-dock" style={{
        padding: '0.75rem 1rem',
        background: 'rgba(0,0,0,0.2)',
        flexShrink: 0,
        minHeight: '60px',
      }}>
        {/* Bet controls */}
        {showBetControls && (
          <BetControls
            minBet={state.minBet || 10}
            maxBet={state.maxBet || 500}
            bankroll={effectiveBankroll}
            onPlaceBet={handlePlaceBet}
            initialBet={lastBet ?? state.minBet}
          />
        )}

        {/* Waiting for other players to bet */}
        {showWaitingForBet && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            padding: '0.75rem',
          }}>
            Bet placed. Waiting for other players...
          </div>
        )}

        {/* Shuffling indicator */}
        {showShuffling && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            fontWeight: 600,
            padding: '1rem',
            animation: 'fadeInOut 2s ease-in-out infinite',
          }}>
            Shuffling...
          </div>
        )}

        {/* Dealing indicator */}
        {showDealing && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            padding: '0.75rem',
          }}>
            Dealing cards...
          </div>
        )}

        {/* Player actions */}
        {showActions && turnInfo && (
          <ActionButtons
            canHit={turnInfo.canHit}
            canStand={turnInfo.canStand}
            canDouble={turnInfo.canDouble}
            canSplit={turnInfo.canSplit}
            canSurrender={turnInfo.canSurrender}
            onAction={handleAction}
          />
        )}

        {/* Waiting for turn */}
        {showWaitingForTurn && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            padding: '0.75rem',
          }}>
            Waiting for other players...
          </div>
        )}

        {/* Dealer turn indicator */}
        {showDealerTurn && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            padding: '0.75rem',
          }}>
            Dealer is playing...
          </div>
        )}

        {/* Settlement indicator */}
        {showWaitingForResult && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            padding: '0.75rem',
          }}>
            Settling...
          </div>
        )}

        {/* Round result */}
        {showResult && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeInUp 0.3s ease-out',
          }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
            }}>
              {roundResult.dealerBlackjack ? 'Dealer Blackjack!' :
               roundResult.dealerBust ? 'Dealer Bust!' :
               `Dealer: ${roundResult.dealerPoints}`}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.6)',
            }}>
              Bankroll: ${effectiveBankroll}
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {myRoundResults.map((r: any, i: number) => (
                <div key={i} style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: r.payout > 0 ? 'rgba(90,158,110,0.2)' : r.payout < 0 ? 'rgba(196,90,90,0.2)' : 'rgba(255,255,255,0.1)',
                  color: r.payout > 0 ? '#5a9e6e' : r.payout < 0 ? '#c45a5a' : 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}>
                  {r.payout > 0 ? `+$${r.payout}` : r.payout < 0 ? `-$${Math.abs(r.payout)}` : 'Push'}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column', alignItems: 'center' }}>
              {myPlayer?.isHost ? (
                <Button size="lg" onClick={handleNextHand}>
                  Start Next Round
                </Button>
              ) : (
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                }}>
                  Waiting for host to start next round...
                </div>
              )}
            </div>
          </div>
        )}

      {showResult && myRoundNet > 0 && (
        <div className="bj-win-burst" aria-hidden="true">
          <div className="bj-win-burst__ring" />
          <div className="bj-win-burst__amount">+${myRoundNet}</div>
          <div className="bj-win-burst__label">Nice win</div>
          {Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ ['--i' as any]: i }} />)}
        </div>
      )}

      </div>
    </div>
  );
}
