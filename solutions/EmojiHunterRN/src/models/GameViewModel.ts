import { useState, useEffect, useCallback } from "react";
import { emojiObjects } from "./Emoji";
import { EmojiSearchStatus } from "./Types";

export const GameViewModel = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [emojiSearchStatus, setEmojiSearchStatus] = useState<EmojiSearchStatus>(EmojiSearchStatus.Searching);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [showNext, setShowNext] = useState(false);
  const [tensorLoaded, setTensorLoaded] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (tensorLoaded && emojiSearchStatus === EmojiSearchStatus.Searching && !isGameOver) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev > 1) { // Logic for updating the timer
            return prev - 1;
          } else {
            clearInterval(timer);
            setEmojiSearchStatus(EmojiSearchStatus.NotFound);
            setShowNext(false);
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tensorLoaded, emojiSearchStatus, isGameOver]);

  const startSearch = useCallback(() => {
    if (currentLevel > emojiObjects.length) {
      setEmojiSearchStatus(EmojiSearchStatus.GameOver);
      setIsGameOver(true);
    } else {
      setCurrentLevel((prev) => prev + 1);
      setTimeRemaining(10);
      setShowNext(false);
      setEmojiSearchStatus(EmojiSearchStatus.Searching);
    }
  }, [currentLevel]);

  const restartGame = useCallback(() => {
    setCurrentLevel(0);
    setTimeRemaining(10);
    setShowNext(false);
    setEmojiSearchStatus(EmojiSearchStatus.Searching);
    setIsGameOver(false);
  }, []);

  return { 
    currentLevel, 
    emojiSearchStatus, 
    timeRemaining, 
    showNext, 
    startSearch, 
    setEmojiSearchStatus, 
    setTensorLoaded,
    restartGame 
  };
};