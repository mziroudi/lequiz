import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PDFParse } from 'pdf-parse';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PDF_PATH = join(ROOT, 'Charte  LPEE Officiel_compressed.pdf');
const OUTPUT_PATH = join(ROOT, 'public', 'charte-text.txt');

async function main() {
  if (!existsSync(PDF_PATH)) {
    if (existsSync(OUTPUT_PATH)) {
      console.log('PDF not found — using existing public/charte-text.txt');
      return;
    }
    throw new Error(`PDF not found at ${PDF_PATH}`);
  }

  const buffer = readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const text = result.text ?? result.pages?.map((p) => p.text).join('\n\n') ?? '';

  writeFileSync(OUTPUT_PATH, text, 'utf-8');
  console.log(`Extracted ${text.length} characters to public/charte-text.txt`);
  await parser.destroy();
}

main().catch(console.error);
