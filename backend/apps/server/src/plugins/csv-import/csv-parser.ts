import { CsvRow } from './types';

/*
 * Parsing of the ERP CSV export (semicolon separated, cp1253 or UTF-8, two header lines).
 * Pure functions only — no Vendure services — so they are easy to unit test.
 */

const CP1253_HI: Record<number, number> = {
    0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026,
    0x86: 0x2020, 0x87: 0x2021, 0x89: 0x2030, 0x8b: 0x2039, 0x91: 0x2018,
    0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013,
    0x97: 0x2014, 0x99: 0x2122, 0x9b: 0x203a, 0xa0: 0x00a0, 0xa1: 0x0385,
    0xa2: 0x0386, 0xa3: 0x00a3, 0xa4: 0x00a4, 0xa5: 0x00a5, 0xa6: 0x00a6,
    0xa7: 0x00a7, 0xa8: 0x00a8, 0xa9: 0x00a9, 0xab: 0x00ab, 0xac: 0x00ac,
    0xad: 0x00ad, 0xae: 0x00ae, 0xaf: 0x2015, 0xb0: 0x00b0, 0xb1: 0x00b1,
    0xb2: 0x00b2, 0xb3: 0x00b3, 0xb4: 0x0384, 0xb5: 0x00b5, 0xb6: 0x00b6,
    0xb7: 0x00b7, 0xb8: 0x0388, 0xb9: 0x0389, 0xba: 0x038a, 0xbb: 0x00bb,
    0xbc: 0x038c, 0xbd: 0x00bd, 0xbe: 0x038e, 0xbf: 0x038f,
    0xc0: 0x0390, 0xc1: 0x0391, 0xc2: 0x0392, 0xc3: 0x0393, 0xc4: 0x0394,
    0xc5: 0x0395, 0xc6: 0x0396, 0xc7: 0x0397, 0xc8: 0x0398, 0xc9: 0x0399,
    0xca: 0x039a, 0xcb: 0x039b, 0xcc: 0x039c, 0xcd: 0x039d, 0xce: 0x039e,
    0xcf: 0x039f, 0xd0: 0x03a0, 0xd1: 0x03a1, 0xd3: 0x03a3, 0xd4: 0x03a4,
    0xd5: 0x03a5, 0xd6: 0x03a6, 0xd7: 0x03a7, 0xd8: 0x03a8, 0xd9: 0x03a9,
    0xda: 0x03aa, 0xdb: 0x03ab, 0xdc: 0x03ac, 0xdd: 0x03ad, 0xde: 0x03ae,
    0xdf: 0x03af, 0xe0: 0x03b0, 0xe1: 0x03b1, 0xe2: 0x03b2, 0xe3: 0x03b3,
    0xe4: 0x03b4, 0xe5: 0x03b5, 0xe6: 0x03b6, 0xe7: 0x03b7, 0xe8: 0x03b8,
    0xe9: 0x03b9, 0xea: 0x03ba, 0xeb: 0x03bb, 0xec: 0x03bc, 0xed: 0x03bd,
    0xee: 0x03be, 0xef: 0x03bf, 0xf0: 0x03c0, 0xf1: 0x03c1, 0xf2: 0x03c2,
    0xf3: 0x03c3, 0xf4: 0x03c4, 0xf5: 0x03c5, 0xf6: 0x03c6, 0xf7: 0x03c7,
    0xf8: 0x03c8, 0xf9: 0x03c9, 0xfa: 0x03ca, 0xfb: 0x03cb, 0xfc: 0x03cc,
    0xfd: 0x03cd, 0xfe: 0x03ce,
};

function decodeCp1253(buf: Buffer): string {
    const chars: string[] = [];
    for (let i = 0; i < buf.length; i++) {
        const b = buf[i];
        if (b < 0x80) {
            chars.push(String.fromCharCode(b));
        } else {
            const cp = CP1253_HI[b];
            chars.push(cp !== undefined ? String.fromCodePoint(cp) : '\ufffd');
        }
    }
    return chars.join('');
}

/**
 * Parses a raw CSV buffer (cp1253 / UTF-8) into structured CsvRow objects.
 */
export function parseCsvBuffer(buffer: Buffer): CsvRow[] {
    // Detect encoding: if the buffer is valid UTF-8 and contains Greek Unicode chars,
    // use UTF-8; otherwise fall back to cp1253 (common for Greek ERP exports).
    let text: string;
    try {
        const utf8 = buffer.toString('utf-8');
        // If decoding as UTF-8 introduces replacement chars, it's likely not UTF-8
        if (utf8.includes('\ufffd')) {
            text = decodeCp1253(buffer);
        } else {
            text = utf8;
        }
    } catch {
        text = decodeCp1253(buffer);
    }

    const rows: CsvRow[] = [];
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle semicolon delimiter with optional double-quoted fields
        const cols = splitCsvLine(line, ';');
        if (cols.length < 5) continue;

        const code = cols[0].trim();
        if (!code) continue;

        const rawName = cols[1].trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
        const name = cleanProductName(rawName);
        const color = cols[2].trim();
        const characteristic = cols[3].trim();
        const rawPrice = cols[4].trim();
        const rawQty = cols[5]?.trim() ?? '0';

        // Parse price: " 2,88 € " → 288
        const priceNumber = parseFloat(rawPrice.replace(/[^0-9,]/g, '').replace(',', '.'));
        const priceWithTax = isNaN(priceNumber) ? 0 : Math.round(priceNumber * 100);

        const quantity = parseInt(rawQty, 10) || 0;

        rows.push({ code, name, color, characteristic, priceWithTax, quantity });
    }

    return rows;
}

/**
 * Clean a raw product name coming from the ERP CSV.
 *
 * Removes:
 *  - Leading parenthesised prefix tokens such as (+), (++), etc.
 *  - ERP code-like tokens: 1–3 letters immediately followed by 3+ digits,
 *    optionally paired with a slash and another code (e.g. Α00116/Α1001, A026).
 *  - Extra surrounding whitespace.
 */
function cleanProductName(raw: string): string {
    return raw
        // Remove leading parenthesised prefix, e.g. (+), (++), (+-), …
        .replace(/^\([^)]*\)\s*/, '')
        // Remove ERP code tokens wherever they appear:
        //   1–3 letters + 3–6 digits, optionally "/letters+digits"
        .replace(/[A-Za-z\u0391-\u03A9\u03B1-\u03C9]{1,3}\d{3,6}(?:\/[A-Za-z\u0391-\u03A9\u03B1-\u03C9]{1,3}\d{3,6})?\s*/g, '')
        .trim();
}

/** Split a single CSV line by the given delimiter respecting double-quoted fields. */
function splitCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

/** Slugify a string for URL slugs (ASCII only, lowercase). */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Sanitize a string for use in SKUs.
 * Keeps Unicode letters (including Greek) and digits; replaces other chars with dashes.
 */
export function cleanForSku(str: string): string {
    return str
        .replace(/[^\p{L}\p{N}]/gu, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 20);
}
