import { useQuiz } from './hooks/useQuiz';
import QuizStart from './components/QuizStart';
import Flashcard from './components/Flashcard';
import QuizResult from './components/QuizResult';
import styles from './App.module.css';

export default function App() {
  const {
    screen,
    currentCard,
    currentIndex,
    revealed,
    totalCards,
    totalAllCards,
    sections,
    selectedSection,
    startQuiz,
    revealAnswer,
    resetCard,
    nextCard,
    prevCard,
    restartQuiz,
    error,
  } = useQuiz();

  const isLastCard = currentIndex + 1 >= totalCards;
  const isFirstCard = currentIndex === 0;

  return (
    <div className="app-shell">
      <div className={styles.app}>
        {screen === 'loading' && (
          <div className={styles.loading} role="status" aria-live="polite">
            <img src="/logo-lpee.png" alt="" className={styles.loadingLogo} aria-hidden="true" />
            <p>Chargement des flashcards…</p>
          </div>
        )}

        {error && screen === 'start' && (
          <p className={styles.error} role="alert">{error}</p>
        )}

        {screen === 'start' && (
          <QuizStart
            onStart={startQuiz}
            questionCount={totalAllCards}
            sections={sections}
          />
        )}

        {screen === 'card' && currentCard && (
          <Flashcard
            card={currentCard}
            cardNumber={currentIndex + 1}
            totalCards={totalCards}
            revealed={revealed}
            onReveal={revealAnswer}
            onReset={resetCard}
            onBackToSections={restartQuiz}
            onPrev={prevCard}
            onNext={nextCard}
            isLastCard={isLastCard}
            isFirstCard={isFirstCard}
          />
        )}

        {screen === 'result' && (
          <QuizResult
            totalQuestions={totalCards}
            onRestart={restartQuiz}
            onRetry={() => startQuiz(selectedSection)}
          />
        )}
      </div>
    </div>
  );
}
