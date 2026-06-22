import ProgressBar from './ProgressBar';
import styles from './QuizQuestion.module.css';

const LABELS = ['A', 'B', 'C', 'D'];

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2zM5 16l.8 2.6L8.5 19.5l-2.7.8L5 23l-.8-2.7L1.5 19.5l2.7-.9L5 16zm14 0l.8 2.6 2.7.9-2.7.8L19 23l-.8-2.7-2.7-.9 2.7-.8L19 16z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  screen,
  selectedAnswer,
  showHint,
  onToggleHint,
  onSelectAnswer,
  onNext,
  onPrev,
  onReset,
  isLastQuestion,
  isFirstQuestion,
}) {
  const isFeedback = screen === 'feedback';

  function getCardState(option) {
    if (!isFeedback) return 'default';

    if (option.isCorrect) return 'correct';
    if (selectedAnswer === option) return 'incorrect';
    return 'neutral';
  }

  return (
    <section className={styles.quiz} aria-labelledby="question-text">
      <div className={styles.topBar}>
        <img src="/logo-lpee.png" alt="LPEE" className={styles.logo} />
        <span className={styles.counter}>{questionNumber} / {totalQuestions}</span>
      </div>

      <ProgressBar current={questionNumber - 1} total={totalQuestions} />

      <h2 id="question-text" className={styles.question}>
        {question.question}
      </h2>

      {showHint && (
        <div className={styles.hintPanel} role="note">
          <p>{question.hint}</p>
        </div>
      )}

      <div className={styles.options} role="list">
        {question.options.map((option, index) => {
          const state = getCardState(option);
          const isSelected = selectedAnswer === option;

          return (
            <div
              key={`${option.text}-${index}`}
              className={`${styles.optionCard} ${styles[state]}`}
              role="listitem"
            >
              <button
                type="button"
                className={styles.optionButton}
                onClick={() => onSelectAnswer(option)}
                disabled={isFeedback}
                aria-label={`Option ${LABELS[index]} : ${option.text}`}
                aria-pressed={isSelected}
              >
                <span className={styles.optionLabel}>{LABELS[index]}</span>
                <span className={styles.optionText}>{option.text}</span>
              </button>

              {isFeedback && (state === 'correct' || state === 'incorrect') && (
                <div className={styles.optionFeedback}>
                  {state === 'correct' && (
                    <p className={styles.statusCorrect}>
                      <CheckIcon />
                      Réponse correcte
                    </p>
                  )}
                  {state === 'incorrect' && (
                    <p className={styles.statusIncorrect}>
                      <CrossIcon />
                      Réponse incorrecte
                    </p>
                  )}
                  <p className={styles.optionExplanation}>
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.explainButton}
          onClick={onToggleHint}
          aria-expanded={showHint}
          aria-label={showHint ? 'Masquer l\'explication' : 'Afficher une explication'}
        >
          <SparkleIcon />
          Expliquer
        </button>

        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.navButton}
            onClick={onPrev}
            disabled={isFirstQuestion}
            aria-label="Question précédente"
          >
            Précédente
          </button>
          {isFeedback ? (
            <button
              type="button"
              className={styles.navPrimary}
              onClick={onNext}
              aria-label={isLastQuestion ? 'Voir les résultats' : 'Question suivante'}
            >
              {isLastQuestion ? 'Résultats' : 'Suivante'}
            </button>
          ) : (
            <button
              type="button"
              className={styles.navButton}
              onClick={onReset}
              aria-label="Réinitialiser le quiz"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
