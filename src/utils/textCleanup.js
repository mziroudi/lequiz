const KNOWN_PHRASES = [
  [/personnalit[eé]\s*et\s*ton\s*de\s*voix\s*du\s*lpee/gi, 'Personnalité et ton de voix du LPEE'],
  [/personnalit[eé]ettondevoixdulpee/gi, 'Personnalité et ton de voix du LPEE'],
  [/personnalit[eé]etton/gi, 'Personnalité et ton'],
  [/personnalit\s*é/gi, 'Personnalité'],
  [/lavoixdulpee/gi, 'La voix du LPEE'],
  [/lavoixdu\s*lpee/gi, 'La voix du LPEE'],
  [/ettondevoix/gi, 'et ton de voix'],
  [/etton/gi, 'et ton'],
  [/devoix/gi, 'de voix'],
  [/dulpee/gi, 'du LPEE'],
  [/strat[eé]gie\s*de\s*marque/gi, 'Stratégie de marque'],
  [/strat[eé]giemarque/gi, 'Stratégie de marque'],
  [/valeurs\s*mission/gi, 'Valeurs — Mission'],
  [/marque\s*garantir/gi, 'Mission — Garantir'],
  [/tonalit[eé]\s*et\s*posture/gi, 'Tonalité et posture'],
  [/éthique\s*agir/gi, 'Éthique — Agir'],
  [/éthiqueetintégrité/gi, 'Éthique et intégrité'],
  [/imagecohérente/gi, 'image cohérente'],
  [/reconnaissableetfidèle/gi, 'reconnaissable et fidèle'],
  [/chartegraphique/gi, 'charte graphique'],
  [/lpeeéthique/gi, 'LPEE — Éthique'],
  [/personnalité et ton de voix du lpee éthique/gi, 'Personnalité et ton de voix du LPEE — Éthique'],
];

const GLUE_WORDS = [
  'représentation', 'graphique', 'organisation', 'philosophie', 'culture', 'ambitions',
  'impressions', 'visuelles', 'déterminant', 'perception', 'reconnaissance', 'primordial',
  'cohérente', 'reconnaissable', 'fidèle', 'valeurs', 'optique', 'projet', 'charte',
  'initié', 'document', 'établirons', 'ensemble', 'normes', 'directives', 'précises',
  'garantir', 'utilisation', 'uniforme', 'harmonieuse', 'éléments', 'constituent',
  'essence', 'identité', 'marque', 'présente', 'terrain', 'ligne', 'communauté',
  'visuelle', 'claire', 'puissante', 'collaborateurs', 'fournisseurs', 'partenaires',
  'invités', 'adopter', 'respecter', 'contribuer', 'collectivement', 'cohérence',
  'valorisation', 'image', 'personnalité', 'tonalité', 'posture', 'intégrité',
  'innovation', 'digitalisation', 'excellence', 'opérationnelle', 'développement',
  'talents', 'transformation', 'levier', 'stratégique', 'infrastructures', 'conformité',
  'sécurité', 'expertise', 'scientifique', 'institution', 'institutionnelle',
  'laboratoire', 'communication', 'technique', 'fiabilité', 'engagement', 'national',
  'durable', 'responsabilité', 'environnementale', 'professionnalisme', 'solidarité',
  'confiance', 'entreprise', 'partenariat', 'accompagner', 'client', 'public',
  'transparence', 'loyauté', 'rigueur', 'intérêt', 'missions', 'compétences',
  'performance', 'équitable', 'mesures', 'prestations', 'amélioration', 'continue',
  'pratiques', 'écoute', 'expert', 'projets', 'durables', 'logotype', 'triangle',
  'stabilité', 'précision', 'fondations', 'solides', 'montserrat', 'typographie',
  'iconographique', 'ingénieurs', 'techniciens', 'chercheurs', 'experts', 'authentique',
  'professionnelle', 'pictogramme', 'empathique', 'bienveillant', 'dimension',
  'humaine', 'collectif', 'dynamique', 'proactif', 'avenir', 'amazigh', 'symbole',
  'reconnaissance', 'gradient', 'secondaires', 'dégradé', 'centre', 'études',
  'recherches', 'métrologie', 'environnement', 'pollution', 'hydraulique',
  'régionales', 'séparateur', 'association', 'acronyme', 'transport', 'national',
  'lpee', 'simple', 'incarne', 'heure', 'jouent', 'rôle', 'doter', 'travers',
  'visant', 'chaque', 'fois', 'ainsi', 'tous', 'service', 'notre', 'leurs',
  'mission', 'vision', 'fondamentales', 'graphique', 'initié', 'éthique',
  'compétitivité', 'opérationnelle', 'digitalisation', 'piliers', 'stratégiques',
  'moteur', 'garantie', 'impact', 'fondement', 'avenir', 'bienveillant',
  'empathique', 'écoute', 'contributions', 'chacun', 'posture', 'tonalité',
].sort((a, b) => b.length - a.length);

const SHORT_GLUE_WORDS = new Set([
  'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'ou', 'en', 'au', 'aux',
  'par', 'pour', 'sur', 'dans', 'avec', 'sans', 'qui', 'que', 'est', 'son', 'sa',
  'ses', 'ce', 'se', 'ne', 'si', 'il', 'elle', 'nous', 'vous', 'ils', 'leur', 'à', 'où',
]);

function mergeSpacedLetterRuns(text) {
  return text.replace(
    /(?:[A-Za-zÀ-ÿ]\s+){3,}(?:[A-Za-zÀ-ÿ](?:\s+[A-Za-zÀ-ÿ])*)+/g,
    (match) => {
      const parts = match.split(/\s+/).filter(Boolean);
      if (parts.length >= 4 && parts.every((p) => p.length === 1)) {
        return parts.join('');
      }
      return match;
    }
  );
}

function decodeSpacedLetterLine(line) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 6) return line;

  const singleCount = tokens.filter((t) => t.length === 1).length;
  if (singleCount / tokens.length < 0.55) return mergeSpacedLetterRuns(line);

  return splitGluedFrench(tokens.join(''));
}

function splitGluedFrench(text) {
  if (!text || !/\S{12,}/.test(text)) return text;

  let remaining = text;
  let result = '';
  let guard = 0;

  while (remaining.length > 0 && guard++ < 2000) {
    let matched = false;

    for (const word of GLUE_WORDS) {
      const slice = remaining.slice(0, word.length);
      if (slice.toLowerCase() === word.toLowerCase()) {
        result += `${result ? ' ' : ''}${remaining.slice(0, word.length)}`;
        remaining = remaining.slice(word.length);
        matched = true;
        break;
      }
    }

    if (!matched && remaining.length >= 2) {
      const two = remaining.slice(0, 2).toLowerCase();
      if (SHORT_GLUE_WORDS.has(two)) {
        result += `${result ? ' ' : ''}${remaining.slice(0, 2)}`;
        remaining = remaining.slice(2);
        matched = true;
      }
    }

    if (!matched && remaining.length >= 1) {
      const one = remaining[0].toLowerCase();
      if (SHORT_GLUE_WORDS.has(one)) {
        result += `${result ? ' ' : ''}${remaining[0]}`;
        remaining = remaining.slice(1);
        matched = true;
      }
    }

    if (!matched) {
      result += `${result && !result.endsWith(' ') ? '' : ''}${remaining[0]}`;
      remaining = remaining.slice(1);
    }
  }

  return result.replace(/\s+/g, ' ').trim();
}

function fixKnownPhrases(text) {
  let result = text;
  for (const [pattern, replacement] of KNOWN_PHRASES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function fixCamelCaseBoundaries(text) {
  return text.replace(/([a-zàâäéèêëîïôöùûüç'’])([A-ZÉÈÊÀÂÄÙÛÜÎÏÔÖÇ])/g, '$1 $2');
}

function fixSpacedApostrophes(text) {
  return text
    .replace(/\s*'\s*/g, "'")
    .replace(/l\s*'\s*/gi, "l'")
    .replace(/d\s*'\s*/gi, "d'")
    .replace(/n\s*'\s*/gi, "n'")
    .replace(/s\s*'\s*/gi, "s'")
    .replace(/j\s*'\s*/gi, "j'")
    .replace(/m\s*'\s*/gi, "m'")
    .replace(/t\s*'\s*/gi, "t'")
    .replace(/c\s*'\s*/gi, "c'")
    .replace(/qu\s*'\s*/gi, "qu'");
}

function fixBrokenSyllables(text) {
  return text
    .replace(/\bMis\s+sion\b/gi, 'Mission')
    .replace(/\bfondam\s+enta\s+les\b/gi, 'fondamentales')
    .replace(/\bgraphiquea(é|e)\s+té\b/gi, 'charte graphique a été')
    .replace(/charte graphiqueaé\s+té/gi, 'charte graphique a été')
    .replace(/\bcharte\s+charte\s+graphique\b/gi, 'charte graphique')
    .replace(/\bdoterd\s*'/gi, "doter d'")
    .replace(/\bC\s*'\s*e\s+s\s+t\b/gi, "C'est")
    .replace(/C[''\u2019]\s*e\s+s\s+t/gi, "C'est")
    .replace(/\bse\s+s\b/gi, 'ses')
    .replace(/\bda\s+n\s+s\b/gi, 'dans')
    .replace(/\bce\s+t\s+te\b/gi, 'cette')
    .replace(/\bn\s+ou\s+s\b/gi, 'nous')
    .replace(/\bso\s+n\s+t\b/gi, 'sont')
    .replace(/\bile\s+s\s+t\b/gi, 'il est')
    .replace(/\baé\s+té\b/gi, 'a été')
    .replace(/\bp\s+our\b/gi, 'pour')
    .replace(/\bprimordialp\s+our\b/gi, 'primordial pour')
    .replace(/\bqu\s*'\s*une\b/gi, "qu'une")
    .replace(/\bd\s*'\s*une\b/gi, "d'une")
    .replace(/\bl\s*'\s*/gi, "l'")
    .replace(/\bLavoix\b/g, 'La voix')
    .replace(/\blavoix\b/gi, 'la voix')
    .replace(/\bave\s+c\b/gi, 'avec')
    .replace(/\bferaave\s+c\b/gi, 'fera avec')
    .replace(/\borganisatione\s+s\s+tp\s+lu\s+s\b/gi, 'organisation est plus')
    .replace(/\bélémentsvi\s+sue\s+l\s+s\b/gi, 'éléments visuels')
    .replace(/\bdé\s+c\s+li\s+nai\s+so\s+n\s+s\b/gi, 'déclinaisons')
    .replace(/\bi\s+n\s+ter\b/gi, 'inter')
    .replace(/([a-zàâéèêëîïôöùûüç])'\s+([a-zàâéè])/gi, "$1' $2")
    .replace(/([A-Za-zÀ-ÿ])É(thique)/gi, '$1 É$2')
    .replace(/lpee(é|è|ê)/gi, 'LPEE $1')
    .replace(/\bT\s*ON\s+ALIT[ÉE]\s*VA\s*LEUR\b/gi, '')
    .replace(/\bS\s*tratégie\s*de\s*marque\b/gi, 'Stratégie de marque')
    .replace(/\bÉthique\s*et\s*intégrité\b/gi, 'Éthique et intégrité')
    .replace(/\bAgir\s*ave\s*c\b/gi, 'Agir avec')
    .replace(/\bto\s+n\s+de\s+voix\b/gi, 'ton de voix')
    .replace(/\bet\s*de\s*la\b/gi, 'et de la')
    .replace(/\betdela\b/gi, 'et de la')
    .replace(/\bi\s+n\s+co\s+n\s+t\s+our\s+nab\s+le\b/gi, 'incontournable')
    .replace(/\bs\s+ouhai\s+te-\s*t-\s*il\b/gi, 'souhaite-t-il')
    .replace(/\bs\s+ouhai\s+tet-\s*il\b/gi, 'souhaite-t-il')
    .replace(/\bi\s+ni\s+tia\s+tive\b/gi, 'initiative')
    .replace(/\bapp\s+li\s+ca\s+tio\s+n\b/gi, 'application')
    .replace(/\bpréfér\s+en\s+tie\s+l\s+le\b/gi, 'préférentielle')
    .replace(/\bori\s+en\s+ta\s+tio\s+n\b/gi, 'orientation')
    .replace(/\btypo\s+graphique\s+s\b/gi, 'typographiques')
    .replace(/\bvisuelle\s+m\s+en\s+t\b/gi, 'visuellement')
    .replace(/\bpro\s+mo\s+tio\s+n\s+ne\s+l\s+le\s+s\b/gi, 'promotionnelles')
    .replace(/\bl'\s+([a-zàâéè])/gi, "l'$1")
    .replace(/l['\u2019]\s+([a-zàâéè])/gi, "l'$1")
    .replace(/d['\u2019]\s+([a-zàâéè])/gi, "d'$1");
}

function collapseSpacedLetterFragments(text) {
  let result = text;
  let prev;

  const shouldCollapse = (parts) => {
    if (parts.length < 3) return false;
    if (!parts.some((p) => p.length === 1)) return false;
    return parts.every((p) => p.length <= 3);
  };

  do {
    prev = result;
    result = result.replace(
      /(?<![A-Za-zÀ-ÿ])(?:[a-zàâäéèêëîïôöùûüç]{1,3}\s+){3,}[a-zàâäéèêëîïôöùûüç]{1,3}(?![A-Za-zÀ-ÿ])/gi,
      (match) => {
        const parts = match.trim().split(/\s+/);
        return shouldCollapse(parts) ? parts.join('') : match;
      }
    );
    result = result.replace(
      /(?<![A-Za-zÀ-ÿ])(?:[a-zàâäéèêëîïôöùûüç]{1,2}\s+){2,}[a-zàâäéèêëîïôöùûüç]{1,2}(?![A-Za-zÀ-ÿ])/gi,
      (match) => {
        const parts = match.trim().split(/\s+/);
        return shouldCollapse(parts) ? parts.join('') : match;
      }
    );
  } while (result !== prev);

  return result;
}

export function cleanDisplayText(text) {
  if (!text) return '';

  let t = String(text);

  t = t.replace(/--\s*\d+\s+of\s+\d+\s+--/g, ' ');
  t = mergeSpacedLetterRuns(t);
  t = t.replace(/(\w)-\s+(\w)/g, '$1$2');
  t = collapseSpacedLetterFragments(t);
  t = fixSpacedApostrophes(t);
  t = fixKnownPhrases(t);
  t = fixBrokenSyllables(t);
  t = fixCamelCaseBoundaries(t);
  t = t.replace(/\bT\s*ON\s+ALIT[ÉE]\s+VA\s*LEUR\b/gi, '');
  t = t.replace(/\bAIRE\s*1\s*STRAT\s*[ÉE]\s*GIEDEMARQUE\b/gi, '');
  t = t.replace(/\bMARQUEMission\s*:\s*/gi, '');
  t = t.replace(/\bMARQUE\s+(?=Garantir)/gi, '');
  t = t.replace(/\bValeursMission\b/gi, 'Valeurs — Mission');
  t = t.replace(/\bLPEEBRANDIDENTITY\b/gi, 'LPEE — Brand Identity');
  t = t.replace(/\bdes des\b/gi, 'des');
  t = t.replace(/\s+([,.;:!?])/g, '$1');
  t = t.replace(/\s*;\s*/g, '; ');
  t = t.replace(/\s+/g, ' ').trim();

  return t;
}

export function cleanPdfText(text) {
  if (!text) return '';
  return text
    .replace(/--\s*\d+\s+of\s+\d+\s+--/g, '\n')
    .split('\n')
    .map((line) => decodeSpacedLetterLine(line.trim()))
    .join('\n');
}
