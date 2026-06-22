export function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function buildQuestionOptions(correctAnswer, wrongAnswers) {
  const options = [
    { text: correctAnswer, isCorrect: true },
    ...wrongAnswers.slice(0, 3).map((text) => ({ text, isCorrect: false })),
  ];

  return shuffleArray(options);
}

export function getFallbackWrongAnswers() {
  return [
    'Aucune de ces réponses',
    'Information non précisée dans la charte',
    'Réponse non conforme à la charte LPEE',
  ];
}
