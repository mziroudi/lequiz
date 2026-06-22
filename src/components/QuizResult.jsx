import styles from './QuizResult.module.css';

function getStars(percentage) {
  if (percentage >= 80) return 3;
  if (percentage >= 60) return 2;
  if (percentage >= 40) return 1;
  return 0;
}

function getMessage(percentage) {
  if (percentage >= 80) return 'Excellent ! Vous maîtrisez parfaitement la charte LPEE.';
  if (percentage >= 60) return 'Très bien ! Quelques révisions et vous serez au top.';
  if (percentage >= 40) return 'Pas mal ! Continuez à vous entraîner.';
  return 'Continuez vos efforts, la charte n\'a plus de secrets pour vous bientôt !';
}

export default function QuizResult({ correctCount, totalQuestions, onRestart, onRetry }) {
  const percentage = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;
  const stars = getStars(percentage);
  const message = getMessage(percentage);

  return (
    <section className={`${styles.result} animate-enter`} aria-labelledby="result-title">
      <div className={styles.branding}>
        <img src="/logo-lpee.png" alt="Logo LPEE" className={styles.logo} />
      </div>

      <h2 id="result-title" className={styles.title}>Résultats</h2>

        <div className={styles.stars} aria-label={`${stars} étoiles sur 3`}>
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={i <= stars ? styles.starFilled : styles.starEmpty}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>

        <p className={styles.resultScore}>
          <span className={styles.resultValue}>{correctCount}</span>
          <span className={styles.resultDivider}>/</span>
          <span className={styles.resultMax}>{totalQuestions}</span>
          <span className={styles.resultLabel}> bonnes réponses</span>
        </p>

        <p className={styles.percentage}>{percentage} %</p>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onRetry}
            aria-label="Refaire le quiz"
          >
            Refaire le quiz
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onRestart}
            aria-label="Retour à l'accueil"
          >
            Retour à l&apos;accueil
          </button>
        </div>
    </section>
  );
}
