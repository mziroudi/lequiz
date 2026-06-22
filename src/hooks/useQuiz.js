import { useState, useEffect, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';
import { buildQuestionOptions, getFallbackWrongAnswers } from '../utils/shuffleAnswers';
import { cleanDisplayText } from '../utils/textCleanup';

export function useQuiz() {
  const [screen, setScreen] = useState('loading');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const [csvRes, distractorsRes, explanationsRes] = await Promise.all([
          fetch('/questions.csv'),
          fetch('/distractors.json'),
          fetch('/explanations.json'),
        ]);

        if (!csvRes.ok) {
          throw new Error('Impossible de charger questions.csv');
        }

        const csvText = await csvRes.text();
        const parsed = parseCSV(csvText);

        let distractorsMap = new Map();
        if (distractorsRes.ok) {
          const distractors = await distractorsRes.json();
          distractorsMap = new Map(
            distractors.map((item) => [item.question, item.wrongAnswers])
          );
        }

        let explanationsMap = new Map();
        if (explanationsRes.ok) {
          const explanations = await explanationsRes.json();
          explanationsMap = new Map(
            explanations.map((item) => [item.question, { hint: item.hint, explanation: item.explanation }])
          );
        }

        const enriched = parsed.map(({ question, correctAnswer }) => {
          const wrongAnswers =
            distractorsMap.get(question) ?? getFallbackWrongAnswers(correctAnswer);
          const explanationData = explanationsMap.get(question) ?? {
            hint: 'Consultez la charte graphique LPEE pour trouver la réponse.',
            explanation: `La bonne réponse est : ${correctAnswer}`,
          };

          return {
            question,
            correctAnswer,
            hint: cleanDisplayText(explanationData.hint),
            explanation: cleanDisplayText(explanationData.explanation),
            options: buildQuestionOptions(correctAnswer, wrongAnswers),
          };
        });

        setQuestions(enriched);
        setScreen('start');
      } catch (err) {
        setError(err.message);
        setScreen('start');
      }
    }

    loadQuestions();
  }, []);

  const resetProgress = useCallback(() => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowHint(false);
    setScreen('question');
  }, []);

  const startQuiz = useCallback(() => {
    resetProgress();
  }, [resetProgress]);

  const selectAnswer = useCallback((option) => {
    if (screen === 'feedback') return;

    setSelectedAnswer(option);
    const correct = option.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }

    setScreen('feedback');
  }, [screen]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setScreen('result');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowHint(false);
    setScreen('question');
  }, [currentIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex <= 0) return;

    setCurrentIndex((prev) => prev - 1);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowHint(false);
    setScreen('question');
  }, [currentIndex]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowHint(false);
    setScreen('start');
  }, []);

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  const currentQuestion = questions[currentIndex] ?? null;

  return {
    screen,
    questions,
    currentIndex,
    currentQuestion,
    correctCount,
    selectedAnswer,
    isCorrect,
    showHint,
    error,
    totalQuestions: questions.length,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    restartQuiz,
    resetProgress,
    toggleHint,
  };
}
