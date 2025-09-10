import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
import { formatHex, parse } from 'culori';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors to exclude or handle specially if needed
const EXCLUDED_COLORS = ['inherit', 'current', 'transparent', 'black', 'white'];

function generateColorMap() {
    const colorMap = new Map();

    // Add black and white manually
    colorMap.set('#000000', 'black');
    colorMap.set('#ffffff', 'white');

    Object.entries(colors).forEach(([colorName, colorValues]) => {
        if (EXCLUDED_COLORS.includes(colorName)) return;

        if (typeof colorValues === 'string') {
            // Handle single string colors
            const parsed = parse(colorValues);
            const hex = parsed ? formatHex(parsed) : null;
            if (hex) colorMap.set(hex, colorName);
        } else {
            Object.entries(colorValues).forEach(([shade, value]) => {
                // Convert OKLCH (or other format) to Hex
                const parsed = parse(value);
                const hex = parsed ? formatHex(parsed) : null;
                if (hex) {
                    colorMap.set(hex, `${colorName}-${shade}`);
                }
            });
        }
    });

    return colorMap;
}

function generateSpacingMap() {
    const map = new Map();
    // Create mapping: pixel value (number) -> class suffix (string)
    // E.g. '4px' -> '1', so map: 4 -> '1'
    Object.entries(defaultTheme.spacing).forEach(([key, value]) => {
        let px = 0;
        if (value.endsWith('px')) {
            px = parseFloat(value);
        } else if (value.endsWith('rem')) {
            const rem = parseFloat(value);
            px = rem * 16;
        }

        if (px > 0) {
            map.set(px, key);
        }
    });
    return map;
}

function generateFontSizeMap() {
    const map = new Map();
    Object.entries(defaultTheme.fontSize).forEach(([key, value]) => {
        // value can be string or [fontSize, lineHeight]
        const size = Array.isArray(value) ? value[0] : value;

        let px = 0;
        if (size.endsWith('px')) {
            px = parseFloat(size);
        } else if (size.endsWith('rem')) {
            px = parseFloat(size) * 16;
        }

        if (px > 0) {
            map.set(px, key);
        }
    });
    return map;
}

function generateBorderRadiusMap() {
    const map = new Map();
    Object.entries(defaultTheme.borderRadius).forEach(([key, value]) => {
        if (key === 'DEFAULT') return; // default usually maps to 'rounded' without suffix

        let px = 0;
        if (value.endsWith('px')) {
            px = parseFloat(value);
        } else if (value.endsWith('rem')) {
            px = parseFloat(value) * 16;
        }

        if (px > 0) {
            map.set(px, key);
        }
    });
    return map;
}

function generateFontWeightMap() {
    const map = new Map();
    Object.entries(defaultTheme.fontWeight).forEach(([key, value]) => {
        map.set(Number(value), key);
    });
    return map;
}


// --- Generators ---

const colorMap = generateColorMap();
const spacingMap = generateSpacingMap();
const fontSizeMap = generateFontSizeMap();
const borderRadiusMap = generateBorderRadiusMap();
const fontWeightMap = generateFontWeightMap();


// --- Output Formatting ---

function mapToString(map, keyType = 'number', valueType = 'string') {
    let str = 'new Map([\n';
    // Sort by key for consistency
    const entries = [...map.entries()].sort((a, b) => {
        if (keyType === 'number') return a[0] - b[0];
        return String(a[0]).localeCompare(String(b[0]));
    });

    entries.forEach(([key, value]) => {
        const k = keyType === 'string' ? `"${key}"` : key;
        const v = valueType === 'string' ? `"${value}"` : value;
        str += `    [${k}, ${v}],\n`;
    });
    str += '])';
    return str;
}

const fileContent = `/**
 * THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
 * Run \`npm run generate:config\` to update.
 */

export const tailwindColors = ${mapToString(colorMap, 'string', 'string')};

export const tailwindSpacing = ${mapToString(spacingMap, 'number', 'string')};

export const tailwindFontSize = ${mapToString(fontSizeMap, 'number', 'string')};

export const tailwindBorderRadius = ${mapToString(borderRadiusMap, 'number', 'string')};

export const tailwindFontWeight = ${mapToString(fontWeightMap, 'number', 'string')};
`;

const outputPath = path.resolve(__dirname, '../plugin/codeGenerators/css/tailwindDefaults.ts');
fs.writeFileSync(outputPath, fileContent);

console.log(`Successfully generated tailwindDefaults.ts at ${outputPath}`);
