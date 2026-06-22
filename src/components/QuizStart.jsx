import { motion } from 'motion/react';
import { fadeUpTransition, fadeUpVariants } from '../motion/transitions';
import styles from './QuizStart.module.css';

export default function QuizStart({ onStart, questionCount }) {
  return (
    <motion.section
      className={styles.start}
      aria-labelledby="quiz-title"
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={fadeUpTransition}
    >
      <div className={styles.branding}>
        <img
          src="/logo-lpee.png"
          alt="Logo LPEE"
          className={styles.logo}
        />
      </div>

      <h1 id="quiz-title" className={styles.title}>
          Flashcards Charte LPEE
        </h1>
        <p className={styles.subtitle}>
          Révisez la charte graphique officielle : question au recto,
          réponse au verso. Évaluez-vous carte après carte.
        </p>

        <p className={styles.info}>
          {questionCount > 0 ? `${questionCount} cartes` : 'Chargement…'}
        </p>

        <motion.button
          type="button"
          className={styles.button}
          onClick={onStart}
          disabled={questionCount === 0}
          aria-label="Commencer les flashcards LPEE"
          whileHover={questionCount > 0 ? { scale: 1.03 } : undefined}
          whileTap={questionCount > 0 ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.15 }}
        >
          Commencer
        </motion.button>
    </motion.section>
  );
}
