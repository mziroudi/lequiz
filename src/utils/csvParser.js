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

export function parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => {
    const fields = parseCSVLine(line);
    if (fields.length < 2) {
      return null;
    }

    const question = fields[0];
    const section = fields.length >= 3 ? fields[fields.length - 1] : 'autre';
    const correctAnswer = (fields.length >= 3
      ? fields.slice(1, -1)
      : fields.slice(1)
    ).join(',').trim();

    if (!question || !correctAnswer) {
      return null;
    }

    return { question, correctAnswer, section };
  }).filter(Boolean);
}
