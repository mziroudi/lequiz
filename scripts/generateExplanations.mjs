import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { cleanDisplayText, cleanPdfText } from '../src/utils/textCleanup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CSV_PATH = join(ROOT, 'public', 'questions.csv');
const CHARTE_PATH = join(ROOT, 'public', 'charte-text.txt');
const OUTPUT_PATH = join(ROOT, 'public', 'explanations.json');

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'en', 'dans', 'pour',
  'par', 'sur', 'que', 'qui', 'quoi', 'quel', 'quelle', 'quels', 'quelles', 'est',
  'sont', 'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'au', 'aux', 'lpee', 'charte',
  'citez', 'completez', 'definissez', 'comment', 'pourquoi', 'peut', 'doit', 'etre',
  'avec', 'sans', 'entre', 'selon', 'quelle', 'quelles', 'logo', 'logotype',
]);

function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key && !(key in process.env)) process.env[key.trim()] = value;
  }
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else current += char;
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text) {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [question, ...answerParts] = parseCSVLine(line);
    return { question, correctAnswer: answerParts.join(',').trim() };
  }).filter((item) => item.question && item.correctAnswer);
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasBrokenLetterSpacing(text) {
  const matches = text.match(
    /(?<![A-Za-zÀ-ÿ])(?:[a-zàâäéèêëîïôöùûüç]{1,3}\s+){3,}[a-zàâäéèêëîïôöùûüç]{1,3}(?![A-Za-zÀ-ÿ])/gi
  ) || [];
  return matches.some((match) => {
    const parts = match.trim().split(/\s+/);
    return parts.some((p) => p.length === 1) && parts.every((p) => p.length <= 3);
  });
}

function isJunkText(text) {
  const t = text.toLowerCase();
  return (
    /lorem ipsum|sous-titre sur plus|n° de réception|essai programmé|01 02 03 04|50 caractères 3\.9/i.test(t)
    || /suspendisse ultrices/i.test(t)
    || /lavoixdulpee|ettondevoix|personnalit\s*é\s*etton/i.test(t)
    || /brandidentity|heureoùlesimpressions|introduction l/i.test(t)
    || (t.match(/\d{2}\s+\d{2}\s+\d{2}/) && t.length < 200)
  );
}

function truncate(text, max = 240) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function polishPassage(text) {
  let passage = cleanDisplayText(text);
  const sectionCut = passage.search(/\s\d+\.\d+\s+[A-ZÀÉÈ]/);
  if (sectionCut > 50) passage = passage.slice(0, sectionCut).trim();
  return passage;
}

function findAcronymContext(rawText, acronym, correctAnswer = '') {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('--'));
  const upper = acronym.toUpperCase();
  const answerNorm = normalize(correctAnswer);
  let best = null;
  let bestScore = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toUpperCase() !== upper) continue;

    const nameParts = [];
    const nameLinePattern = /^(Centre|des |sur l|Laboratoire|Direction|Le |l')/i;
    for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
      const prev = lines[j];
      if (/^[A-Z]{2,8}$/.test(prev)) break;
      if (/CTR/i.test(prev)) break;
      if (/^\d+\.\d+\s/.test(prev)) break;
      if (/lorem ipsum|sous-titre|réception|hoceima/i.test(prev)) break;
      if (!nameLinePattern.test(prev)) break;
      nameParts.unshift(cleanPdfText(prev));
    }

    if (!nameParts.length) continue;

    const passage = polishPassage(`${nameParts.join(' ')} (${upper})`);
    if (isJunkText(passage)) continue;

    const passageNorm = normalize(passage);
    let score = 10;
    if (answerNorm && passageNorm.includes(answerNorm.slice(0, 25))) score += 25;
    for (const word of answerNorm.split(/\s+/).filter((w) => w.length > 5)) {
      if (passageNorm.includes(word)) score += 4;
    }
    if (nameParts.length <= 3) score += 5;

    if (score > bestScore) {
      bestScore = score;
      best = passage;
    }
  }

  return best;
}

function buildNeedles(phrase) {
  const cleaned = phrase.replace(/\([^)]*\)/g, '').trim();
  const needles = new Set();

  needles.add(cleaned.slice(0, Math.min(cleaned.length, 50)));
  needles.add(cleaned.split(/\s+/).slice(0, 3).join(' '));

  const words = cleaned.split(/\s+/);
  for (let start = 0; start < words.length; start++) {
    for (let end = start + 2; end <= words.length; end++) {
      const sub = words.slice(start, end).join(' ');
      if (sub.length > 10) needles.add(sub);
    }
  }

  const years = cleaned.match(/\b(19|20)\d{2}\b/g);
  if (years) years.forEach((y) => needles.add(y));

  return [...needles]
    .filter((n) => n && (n.length > 8 || /^\d{4}$/.test(n)))
    .sort((a, b) => b.length - a.length);
}

function isGluedText(text) {
  return /\S{28,}/.test(text);
}

function findPassageByAnswer(correctAnswer, rawText) {
  const cleaned = cleanPdfText(rawText);
  const phrases = correctAnswer
    .split(/[,;]/)
    .map((p) => p.replace(/\([^)]*\)/g, '').trim())
    .filter((p) => p.length > 4)
    .sort((a, b) => b.length - a.length);

  const allNeedles = phrases.flatMap(buildNeedles);

  for (const needle of allNeedles) {
    const idx = cleaned.toLowerCase().indexOf(needle.toLowerCase());
    if (idx < 0) continue;

    let start = Math.max(0, idx - 20);
    if (/^\d{4}$/.test(needle)) {
      start = Math.max(0, cleaned.lastIndexOf('.', idx - 10) + 1);
    } else if (start > 0) {
      const wordStart = cleaned.lastIndexOf(' ', idx);
      if (wordStart > 0 && wordStart > idx - 40) start = wordStart + 1;
    }
    const end = Math.min(cleaned.length, idx + needle.length + (/^\d{4}$/.test(needle) ? 200 : 160));
    const passage = polishPassage(cleaned.slice(start, end).trim());
    if (passage.length > 20 && !isJunkText(passage) && !isGluedText(passage)) return passage;
  }
  return null;
}

function extractSearchTerms(question, correctAnswer) {
  const terms = new Set();
  const addFrom = (text) => {
    const words = normalize(text).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    for (const w of words) {
      if (w.length >= 2 && !STOP_WORDS.has(w)) terms.add(w);
    }
    const numbers = text.match(/\d+/g);
    if (numbers) numbers.forEach((n) => terms.add(n));
    const acronyms = text.match(/\b[A-Z]{2,}\b/g);
    if (acronyms) acronyms.forEach((a) => terms.add(a.toLowerCase()));
  };
  addFrom(question);
  addFrom(correctAnswer);
  return [...terms];
}

function splitSentences(text) {
  return cleanPdfText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => polishPassage(s.trim()))
    .filter((s) => s.length > 25 && s.length < 450 && !isJunkText(s) && !isGluedText(s));
}

function scoreSentence(sentence, terms, correctAnswer, question) {
  const normSentence = normalize(sentence);
  const normAnswer = normalize(correctAnswer);
  const normQuestion = normalize(question);
  let score = 0;

  for (const term of terms) {
    if (normSentence.includes(term)) {
      score += term.length >= 8 ? 6 : term.length >= 5 ? 4 : 2;
    }
  }

  const answerParts = correctAnswer.split(/[,;]/).map((p) => normalize(p.trim())).filter((p) => p.length > 5);
  for (const part of answerParts) {
    if (normSentence.includes(part)) score += 15;
  }

  if (normSentence.includes(normAnswer.slice(0, Math.min(30, normAnswer.length)))) score += 20;

  if (/piliers strategiques|lavoixdulpee|tonalite et posture personnalite/i.test(normSentence)) {
    if (!/pilier|innovation|digitalisation|ton|voix|personnalite/i.test(normQuestion)) {
      score -= 20;
    }
  }

  return score;
}

function pickBestSentences(sentences, terms, correctAnswer, question) {
  return sentences
    .map((s) => ({ s, score: scoreSentence(s, terms, correctAnswer, question) }))
    .filter((item) => item.score > 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.s);
}

function extractAcronymFromAnswer(text) {
  const paren = text.match(/\(([A-Z]{2,8})\)/);
  if (paren) return paren[1];
  const match = text.match(/\b([A-Z]{2,8})\b/);
  return match ? match[1] : null;
}

function extractAcronymFromQuestion(question) {
  const acr = question.match(/acronyme\s+([A-Z]{2,8})/i);
  if (acr) return acr[1].toUpperCase();
  return null;
}

function buildPassage(question, correctAnswer, charteText) {
  const acronym = extractAcronymFromQuestion(question) || extractAcronymFromAnswer(correctAnswer);
  if (acronym) {
    const ctx = findAcronymContext(charteText, acronym, correctAnswer);
    if (ctx) return ctx;
  }

  const byAnswer = findPassageByAnswer(correctAnswer, charteText);
  if (byAnswer) return byAnswer;

  const terms = extractSearchTerms(question, correctAnswer);
  const sentences = pickBestSentences(splitSentences(charteText), terms, correctAnswer, question);
  if (sentences.length > 0) return sentences.join(' ');

  return null;
}

function buildHint(question, correctAnswer, passage) {
  if (/acronyme|centre/i.test(question) && passage) {
    return `Indice : la charte associe un nom complet à un sigle. Cherchez la définition de l'organisme mentionné dans la question.`;
  }

  if (passage && passage.length > 30) {
    const topic = question
      .replace(/\?.*$/, '')
      .replace(/^(quelle|quel|quels|quelles|citez|complétez|définissez|comment|pourquoi|peut-on|est-il)\s+/i, '')
      .trim();
    return `Indice : consultez la section de la charte sur « ${truncate(topic, 70)} ».`;
  }

  return `Indice : relisez la charte graphique LPEE en lien avec cette question.`;
}

function buildExplanation(correctAnswer, passage) {
  if (passage) {
    return `D'après la charte graphique LPEE : ${truncate(passage, 260)} La réponse attendue est : ${correctAnswer}`;
  }
  return `La bonne réponse est : ${correctAnswer}. Cette information est définie dans la charte graphique officielle du LPEE.`;
}

function generateEntry(question, correctAnswer, charteText) {
  const passage = buildPassage(question, correctAnswer, charteText);
  return {
    question,
    hint: cleanDisplayText(buildHint(question, correctAnswer, passage)),
    explanation: cleanDisplayText(buildExplanation(correctAnswer, passage)),
  };
}

function isStaleEntry(entry) {
  if (!entry?.hint || !entry?.explanation) return true;
  const blob = `${entry.hint} ${entry.explanation}`;
  return (
    blob.includes('ValeursMission')
    || blob.includes('LavoixduLPEE')
    || blob.includes('ettondevoix')
    || blob.includes('Personnalit é')
    || hasBrokenLetterSpacing(blob)
    || entry.hint === entry.explanation
    || isJunkText(blob)
  );
}

async function main() {
  loadEnv();
  const force = process.argv.includes('--force');

  const questions = parseCSV(readFileSync(CSV_PATH, 'utf-8'));
  const charteText = existsSync(CHARTE_PATH) ? readFileSync(CHARTE_PATH, 'utf-8') : '';

  let existing = [];
  if (!force && existsSync(OUTPUT_PATH)) {
    try { existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8')); } catch { existing = []; }
  }
  const cache = new Map(existing.map((item) => [item.question, item]));

  let generated = 0;
  let skipped = 0;
  const output = [];

  for (const { question, correctAnswer } of questions) {
    const cached = cache.get(question);
    if (cached && !isStaleEntry(cached)) {
      output.push(cached);
      skipped++;
      continue;
    }
    output.push(generateEntry(question, correctAnswer, charteText));
    generated++;
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ ${output.length} explications (${generated} générées, ${skipped} en cache)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
