import { useState, useEffect, useCallback, useRef } from 'react';
import { GameSettings, GameScore, GameState } from '../utils/game';

export function useGameState(settings: GameSettings) {
  const [gameState, setGameState] = useState<GameState>('selecting');
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState<GameScore>({
    correct: 0,
    skipped: 0,
    items: [],
  });
  const [actionInProgress, setActionInProgress] = useState(false);
  const [lastActionTimestamp, setLastActionTimestamp] = useState(0);
  
  // Reset the game state
  const resetGame = useCallback(() => {
    setGameState('selecting');
    setTimeLeft(settings.timeLimit);
    setCurrentItemIndex(0);
    setActionInProgress(false);
    setLastActionTimestamp(0);
    setScore({
      correct: 0,
      skipped: 0,
      items: [],
    });
  }, [settings.timeLimit]);

  // Start the game
  const startGame = useCallback((items: string[]) => {
    if (items.length === 0) return;
    
    // Shuffle the items
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    setCurrentItems(shuffledItems);
    setGameState('ready');
  }, []);

  // Begin gameplay after countdown
  const beginPlay = useCallback(() => {
    setGameState('playing');
  }, []);

  // End the game manually
  const endGame = useCallback(() => {
    setGameState('finished');
  }, []);

  // Mark current item as correct with improved responsiveness
  const markCorrect = useCallback(() => {
    if (gameState !== 'playing' || actionInProgress) return;
    
    // Prevent rapid sequential actions with longer debounce
    const now = Date.now();
    if (now - lastActionTimestamp < 800) return;
    setLastActionTimestamp(now);

    // Immediately update score and set action in progress
    setScore(prev => ({
      ...prev,
      correct: prev.correct + 1,
      items: [...prev.items, { text: currentItems[currentItemIndex], status: 'correct' }],
    }));
    
    setActionInProgress(true);

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      // Slightly longer delay for better visual feedback
      setTimeout(() => {
        if (currentItemIndex < currentItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          // End the game when we run out of words
          setGameState('finished');
        }
        setActionInProgress(false);
      }, 800); // Adjusted delay for better user feedback
    });
  }, [gameState, currentItems, currentItemIndex, lastActionTimestamp, actionInProgress]);

  // Mark current item as skipped with improved responsiveness
  const markSkipped = useCallback(() => {
    if (gameState !== 'playing' || actionInProgress) return;
    
    // Prevent rapid sequential actions with longer debounce
    const now = Date.now();
    if (now - lastActionTimestamp < 800) return;
    setLastActionTimestamp(now);

    // Immediately update score and set action in progress
    setScore(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      items: [...prev.items, { text: currentItems[currentItemIndex], status: 'skipped' }],
    }));
    
    setActionInProgress(true);

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      // Slightly longer delay for better visual feedback
      setTimeout(() => {
        if (currentItemIndex < currentItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          // End the game when we run out of words
          setGameState('finished');
        }
        setActionInProgress(false);
      }, 800); // Adjusted delay for better user feedback
    });
  }, [gameState, currentItems, currentItemIndex, lastActionTimestamp]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  return {
    gameState,
    timeLeft,
    currentItem: currentItems[currentItemIndex] || '',
    score,
    actionInProgress,
    resetGame,
    startGame,
    beginPlay,
    endGame,
    markCorrect,
    markSkipped,
  };
}

export function useDeviceOrientation() {
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isSupported, setIsSupported] = useState(false);

  // All mutable detection state lives in refs so the effect never needs to re-run
  const lastActionTime = useRef(0);
  const neutralBeta = useRef<number | null>(null);
  const readings = useRef<number[]>([]);
  // Hysteresis: must return to neutral before the same direction can fire again
  const lastTriggered = useRef<'up' | 'down' | 'neutral'>('neutral');

  // Call this when the user is in position to zero out the baseline
  const calibrate = useCallback(() => {
    neutralBeta.current = null;
    readings.current = [];
    lastTriggered.current = 'neutral';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return;
    setIsSupported(true);

    // Only beta (front-to-back tilt) is used. Gamma and alpha are ignored.
    const THRESHOLD = 45;    // must tilt 45° from neutral to trigger
    const NEUTRAL_ZONE = 10; // must return within ±10° before re-triggering
    const DEBOUNCE_MS = 800;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null) return;

      // Auto-calibrate on first reading after calibrate() is called
      if (neutralBeta.current === null) {
        neutralBeta.current = e.beta;
        return;
      }

      readings.current = [...readings.current, e.beta].slice(-4);

      if (readings.current.length < 3) return;

      const avgBeta =
        readings.current.reduce((s: number, r: number) => s + r, 0) /
        readings.current.length;

      const delta = avgBeta - neutralBeta.current;

      // Back in neutral — reset so next deliberate tilt can fire
      if (Math.abs(delta) < NEUTRAL_ZONE) {
        if (lastTriggered.current !== 'neutral') {
          lastTriggered.current = 'neutral';
          setDirection('neutral');
        }
        return;
      }

      const now = Date.now();
      if (now - lastActionTime.current < DEBOUNCE_MS) return;

      if (delta < -THRESHOLD && lastTriggered.current !== 'up') {
        lastTriggered.current = 'up';
        setDirection('up');   // tilt back = correct
        lastActionTime.current = now;
      } else if (delta > THRESHOLD && lastTriggered.current !== 'down') {
        lastTriggered.current = 'down';
        setDirection('down'); // tilt forward = skip
        lastActionTime.current = now;
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []); // empty — all state accessed via refs, no stale closures

  const requestPermission = useCallback(async (): Promise<boolean> => {
    type DOEiOS = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
    };
    const DOE = DeviceOrientationEvent as DOEiOS;
    if (typeof DOE.requestPermission === 'function') {
      try {
        return (await DOE.requestPermission()) === 'granted';
      } catch {
        return false;
      }
    }
    return true; // Android / desktop — no permission needed
  }, []);

  return { direction, isSupported, requestPermission, calibrate };
}

export function useKeyboardControls() {
  const [keyDirection, setKeyDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [lastKeyChange, setLastKeyChange] = useState(0);
  const [keyPressActive, setKeyPressActive] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyChange < 300 || keyPressActive) return; // Longer debounce on key presses
      
      if (e.key === 'ArrowDown') {
        setKeyDirection('down');
        setKeyPressActive(true);
        setLastKeyChange(now);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setKeyDirection('up');
        setKeyPressActive(true);
        setLastKeyChange(now);
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setKeyDirection('neutral');
        setKeyPressActive(false);
        // Add a small delay before allowing new keypresses
        setTimeout(() => {
          setLastKeyChange(Date.now());
        }, 200);
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [lastKeyChange, keyPressActive]);

  return keyDirection;
}
