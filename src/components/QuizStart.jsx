import styles from './QuizStart.module.css';

export default function QuizStart({ onStart, questionCount }) {
  return (
    <section className={`${styles.start} animate-enter`} aria-labelledby="quiz-title">
      <div className={styles.branding}>
        <img
          src="/logo-lpee.png"
          alt="Logo LPEE"
          className={styles.logo}
        />
      </div>

      <h1 id="quiz-title" className={styles.title}>
          Quiz Charte LPEE
        </h1>
        <p className={styles.subtitle}>
          Évaluez vos connaissances sur l&apos;identité visuelle, les valeurs
          et les directives de la charte graphique officielle.
        </p>

        <p className={styles.info}>
          {questionCount > 0 ? `${questionCount} questions` : 'Chargement…'}
        </p>

        <button
          type="button"
          className={styles.button}
          onClick={onStart}
          disabled={questionCount === 0}
          aria-label="Commencer le quiz LPEE"
        >
          Commencer le quiz
        </button>
    </section>
  );
}
