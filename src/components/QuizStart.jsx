import { motion } from 'motion/react';
import { fadeUpTransition, fadeUpVariants } from '../motion/transitions';
import styles from './QuizStart.module.css';

export default function QuizStart({ onStart, questionCount, sections }) {
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
        Choisissez une section de la charte ou révisez l&apos;ensemble des cartes.
      </p>

      <p className={styles.info}>
        {questionCount > 0 ? `${questionCount} cartes au total` : 'Chargement…'}
      </p>

      <div className={styles.sections} role="list" aria-label="Sections de la charte">
        <motion.button
          type="button"
          className={`${styles.sectionButton} ${styles.sectionButtonAll}`}
          onClick={() => onStart(null)}
          disabled={questionCount === 0}
          aria-label={`Réviser toutes les cartes (${questionCount})`}
          whileHover={questionCount > 0 ? { scale: 1.02 } : undefined}
          whileTap={questionCount > 0 ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.15 }}
        >
          <span className={styles.sectionLabel}>Toutes les sections</span>
          <span className={styles.sectionCount}>{questionCount} cartes</span>
        </motion.button>

        {sections.map((section) => (
          <motion.button
            key={section.id}
            type="button"
            className={styles.sectionButton}
            onClick={() => onStart(section.id)}
            aria-label={`Réviser ${section.label} (${section.count} cartes)`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <span className={styles.sectionLabel}>{section.label}</span>
            <span className={styles.sectionCount}>{section.count} cartes</span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
