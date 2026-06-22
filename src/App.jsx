import { useQuiz } from './hooks/useQuiz';
import QuizStart from './components/QuizStart';
import QuizQuestion from './components/QuizQuestion';
import QuizResult from './components/QuizResult';
import styles from './App.module.css';

export default function App() {
  const {
    screen,
    currentQuestion,
    currentIndex,
    correctCount,
    totalQuestions,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    restartQuiz,
    resetProgress,
    selectedAnswer,
    showHint,
    toggleHint,
    error,
  } = useQuiz();

  const isLastQuestion = currentIndex + 1 >= totalQuestions;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className="app-shell">
      <div className={styles.app}>
        {screen === 'loading' && (
          <div className={styles.loading} role="status" aria-live="polite">
            <img src="/logo-lpee.png" alt="" className={styles.loadingLogo} aria-hidden="true" />
            <p>Chargement du quiz…</p>
          </div>
        )}

        {error && screen === 'start' && (
          <p className={styles.error} role="alert">{error}</p>
        )}

        {screen === 'start' && (
          <QuizStart onStart={startQuiz} questionCount={totalQuestions} />
        )}

        {(screen === 'question' || screen === 'feedback') && currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            screen={screen}
            selectedAnswer={selectedAnswer}
            showHint={showHint}
            onToggleHint={toggleHint}
            onSelectAnswer={selectAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            onReset={resetProgress}
            isLastQuestion={isLastQuestion}
            isFirstQuestion={isFirstQuestion}
          />
        )}

        {screen === 'result' && (
          <QuizResult
            correctCount={correctCount}
            totalQuestions={totalQuestions}
            onRestart={restartQuiz}
            onRetry={startQuiz}
          />
        )}
      </div>
    </div>
  );
}
