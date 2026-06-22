import { useState, useEffect, useCallback, useMemo } from 'react';
import { parseCSV } from '../utils/csvParser';
import { getOrderedSectionsWithCounts } from '../data/sections';

export function useQuiz() {
  const [screen, setScreen] = useState('loading');
  const [allCards, setAllCards] = useState([]);
  const [activeCards, setActiveCards] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
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

        setAllCards(parsed);
        setScreen('start');
      } catch (err) {
        setError(err.message);
        setScreen('start');
      }
    }

    loadCards();
  }, []);

  const sections = useMemo(
    () => getOrderedSectionsWithCounts(allCards),
    [allCards],
  );

  const startQuiz = useCallback((sectionId = null) => {
    const filtered = sectionId
      ? allCards.filter((card) => card.section === sectionId)
      : allCards;

    setActiveCards(filtered);
    setSelectedSection(sectionId);
    setCurrentIndex(0);
    setRevealed(false);
    setRevealedCards({});
    setScreen('card');
  }, [allCards]);

  const revealAnswer = useCallback(() => {
    setRevealed(true);
    setRevealedCards((prev) => ({ ...prev, [currentIndex]: true }));
  }, [currentIndex]);

  const resetCard = useCallback(() => {
    setRevealed(false);
    setRevealedCards((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  }, [currentIndex]);

  const goToCard = useCallback((index) => {
    setCurrentIndex(index);
    setRevealed(Boolean(revealedCards[index]));
  }, [revealedCards]);

  const nextCard = useCallback(() => {
    if (currentIndex + 1 >= activeCards.length) {
      setScreen('result');
      return;
    }
    goToCard(currentIndex + 1);
  }, [currentIndex, activeCards.length, goToCard]);

  const prevCard = useCallback(() => {
    if (currentIndex <= 0) return;
    goToCard(currentIndex - 1);
  }, [currentIndex, goToCard]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setRevealed(false);
    setRevealedCards({});
    setActiveCards([]);
    setSelectedSection(null);
    setScreen('start');
  }, []);

  const currentCard = activeCards[currentIndex] ?? null;

  return {
    screen,
    allCards,
    activeCards,
    sections,
    selectedSection,
    currentIndex,
    currentCard,
    revealed,
    error,
    totalCards: activeCards.length,
    totalAllCards: allCards.length,
    startQuiz,
    revealAnswer,
    resetCard,
    nextCard,
    prevCard,
    restartQuiz,
  };
}
