import { useState, useEffect, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';

export function useQuiz() {
  const [screen, setScreen] = useState('loading');
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCards() {
      try {
        const csvRes = await fetch('/questions.csv');

        if (!csvRes.ok) {
          throw new Error('Impossible de charger questions.csv');
        }

        const csvText = await csvRes.text();
        const parsed = parseCSV(csvText);

        setCards(parsed.map(({ question, correctAnswer }) => ({ question, correctAnswer })));
        setScreen('start');
      } catch (err) {
        setError(err.message);
        setScreen('start');
      }
    }

    loadCards();
  }, []);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setRevealed(false);
    setRevealedCards({});
    setScreen('card');
  }, []);

  const startQuiz = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const revealAnswer = useCallback(() => {
    setRevealed(true);
    setRevealedCards((prev) => ({ ...prev, [currentIndex]: true }));
  }, [currentIndex]);

  const goToCard = useCallback((index) => {
    setCurrentIndex(index);
    setRevealed(Boolean(revealedCards[index]));
  }, [revealedCards]);

  const nextCard = useCallback(() => {
    if (currentIndex + 1 >= cards.length) {
      setScreen('result');
      return;
    }
    goToCard(currentIndex + 1);
  }, [currentIndex, cards.length, goToCard]);

  const prevCard = useCallback(() => {
    if (currentIndex <= 0) return;
    goToCard(currentIndex - 1);
  }, [currentIndex, goToCard]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setRevealed(false);
    setRevealedCards({});
    setScreen('start');
  }, []);

  const currentCard = cards[currentIndex] ?? null;

  return {
    screen,
    cards,
    currentIndex,
    currentCard,
    revealed,
    error,
    totalCards: cards.length,
    startQuiz,
    revealAnswer,
    nextCard,
    prevCard,
    restartQuiz,
  };
}
