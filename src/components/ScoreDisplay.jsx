import styles from './ScoreDisplay.module.css';

export default function ScoreDisplay({ score }) {
  return (
    <div className={styles.score} aria-live="polite" aria-atomic="true">
      Score : <strong>{score}</strong> pts
    </div>
  );
}
