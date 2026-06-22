import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CSV_PATH = join(ROOT, 'public', 'questions.csv');
const OUTPUT_PATH = join(ROOT, 'public', 'distractors.json');

function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key && !(key in process.env)) {
      process.env[key.trim()] = value;
    }
  }
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const fields = parseCSVLine(line);
      const question = fields[0];
      const correctAnswer = (fields.length >= 3
        ? fields.slice(1, -1)
        : fields.slice(1)
      ).join(',').trim();
      return { question, correctAnswer };
    })
    .filter((item) => item.question && item.correctAnswer);
}

function getStaticFallback() {
  return [
    'Aucune de ces réponses',
    'Information non précisée dans la charte',
    'Réponse non conforme à la charte LPEE',
  ];
}

function isStaleDistractor(item) {
  if (!item?.wrongAnswers || item.wrongAnswers.length !== 3) return true;
  return item.wrongAnswers.some((a) => /…|\.\.\./.test(a));
}

async function generateWithClaude(question, correctAnswer, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Tu es un assistant qui crée des distracteurs pour un quiz sur la charte graphique du LPEE (Laboratoire Public d'Essais et d'Études).

Question : "${question}"
Bonne réponse : "${correctAnswer}"

Génère exactement 3 mauvaises réponses plausibles en français, distinctes de la bonne réponse et les unes des autres. Elles doivent sembler crédibles pour quelqu'un qui connaît vaguement le sujet.

Réponds UNIQUEMENT avec un tableau JSON de 3 chaînes, sans texte avant ou après. Exemple : ["réponse 1", "réponse 2", "réponse 3"]`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim() ?? '';
  const match = text.match(/\[[\s\S]*\]/);

  if (!match) {
    throw new Error(`Invalid response format: ${text}`);
  }

  const wrongAnswers = JSON.parse(match[0]);

  if (!Array.isArray(wrongAnswers) || wrongAnswers.length < 3) {
    throw new Error('Expected 3 wrong answers');
  }

  return wrongAnswers.slice(0, 3).map(String);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  loadEnv();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  const questions = parseCSV(csvText);

  let existing = [];
  if (existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  const cache = new Map(existing.map((item) => [item.question, item]));

  let generated = 0;
  let skipped = 0;

  for (const { question, correctAnswer } of questions) {
    const cached = cache.get(question);

    if (
      cached &&
      Array.isArray(cached.wrongAnswers) &&
      cached.wrongAnswers.length === 3 &&
      !isStaleDistractor(cached)
    ) {
      skipped++;
      continue;
    }

    let wrongAnswers;

    if (apiKey && apiKey !== 'votre_cle_api_anthropic') {
      try {
        console.log(`Génération via Claude : "${question.slice(0, 50)}…"`);
        wrongAnswers = await generateWithClaude(question, correctAnswer, apiKey);
        await sleep(500);
        generated++;
      } catch (error) {
        console.warn(`Échec Claude pour "${question.slice(0, 40)}…" : ${error.message}`);
        wrongAnswers = getStaticFallback();
      }
    } else {
      wrongAnswers = getStaticFallback();
      generated++;
    }

    cache.set(question, { question, correctAnswer, wrongAnswers });
  }

  const output = questions.map(({ question }) => {
    const item = cache.get(question);
    return {
      question: item.question,
      wrongAnswers: item.wrongAnswers,
    };
  });

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  if (!apiKey || apiKey === 'votre_cle_api_anthropic') {
    console.log('⚠️  ANTHROPIC_API_KEY non configurée — distracteurs statiques utilisés.');
  }

  console.log(`✅ ${output.length} questions traitées (${generated} générées/mises à jour, ${skipped} en cache).`);
  console.log(`   Fichier : public/distractors.json`);
}

main().catch((error) => {
  console.error('Erreur :', error);
  process.exit(1);
});
