import { deflateSync } from 'node:zlib';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ASSET_VERSION = 'nomadalingo-native-v1';
const SIZE = 1024;
const SUPERSAMPLE = 2;
const COLORS = {
  sand: [253, 248, 241, 255] as const,
  teal: [42, 157, 143, 255] as const,
  ink: [20, 48, 79, 255] as const,
  transparent: [0, 0, 0, 0] as const,
  white: [255, 255, 255, 255] as const,
};

type Color = readonly [number, number, number, number];
type Point = readonly [number, number];
type AssetOptions = {
  background: Color;
  eye: Color;
  markScale: number;
  path: string;
  pin: Color;
  size?: number;
};

function cubicPoint(
  start: Point,
  control1: Point,
  control2: Point,
  end: Point,
  time: number,
): Point {
  const inverse = 1 - time;
  const x =
    inverse ** 3 * start[0] +
    3 * inverse ** 2 * time * control1[0] +
    3 * inverse * time ** 2 * control2[0] +
    time ** 3 * end[0];
  const y =
    inverse ** 3 * start[1] +
    3 * inverse ** 2 * time * control1[1] +
    3 * inverse * time ** 2 * control2[1] +
    time ** 3 * end[1];
  return [x, y];
}

function appendCubic(points: Point[], start: Point, control1: Point, control2: Point, end: Point) {
  for (let step = 1; step <= 36; step += 1) {
    points.push(cubicPoint(start, control1, control2, end, step / 36));
  }
}

function createPinOutline(): Point[] {
  const points: Point[] = [[12, 0.6]];
  appendCubic(points, [12, 0.6], [5.75, 0.6], [0.9, 5.45], [0.9, 11.7]);
  appendCubic(points, [0.9, 11.7], [0.9, 19.6], [9.93, 29.9], [11.25, 31.36]);
  points.push([11.5, 31.58], [12, 31.68], [12.5, 31.58], [12.75, 31.36]);
  appendCubic(points, [12.75, 31.36], [14.07, 29.9], [23.1, 19.6], [23.1, 11.7]);
  appendCubic(points, [23.1, 11.7], [23.1, 5.45], [18.25, 0.6], [12, 0.6]);
  return points;
}

const PIN_OUTLINE = createPinOutline();

function isInsidePolygon(x: number, y: number, polygon: Point[]): boolean {
  let inside = false;
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current++
  ) {
    const [currentX, currentY] = polygon[current];
    const [previousX, previousY] = polygon[previous];
    const crosses = currentY > y !== previousY > y;
    if (
      crosses &&
      x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function sampleMark(
  canvasX: number,
  canvasY: number,
  markScale: number,
  pin: Color,
  eye: Color,
): Color | null {
  const scale = (SIZE * markScale) / 32;
  const centeredX = (canvasX - SIZE / 2) / scale;
  const centeredY = (canvasY - SIZE / 2) / scale;
  const angle = (24 * Math.PI) / 180;
  const localX = centeredX * Math.cos(angle) - centeredY * Math.sin(angle) + 12;
  const localY = centeredX * Math.sin(angle) + centeredY * Math.cos(angle) + 16;

  if (!isInsidePolygon(localX, localY, PIN_OUTLINE)) return null;
  const eyeDistance = Math.hypot(localX - 12, localY - 11.6);
  return eyeDistance <= 4.15 ? eye : pin;
}

function blend(samples: Color[]): Color {
  const total = samples.length;
  return [
    Math.round(samples.reduce((sum, color) => sum + color[0], 0) / total),
    Math.round(samples.reduce((sum, color) => sum + color[1], 0) / total),
    Math.round(samples.reduce((sum, color) => sum + color[2], 0) / total),
    Math.round(samples.reduce((sum, color) => sum + color[3], 0) / total),
  ];
}

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function renderAsset({ background, eye, markScale, path, pin, size = SIZE }: AssetOptions) {
  const scanlines = Buffer.alloc((size * 4 + 1) * size);
  const step = 1 / SUPERSAMPLE;

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * (size * 4 + 1);
    scanlines[rowOffset] = 0;
    for (let x = 0; x < size; x += 1) {
      const samples: Color[] = [];
      for (let sampleY = 0; sampleY < SUPERSAMPLE; sampleY += 1) {
        for (let sampleX = 0; sampleX < SUPERSAMPLE; sampleX += 1) {
          samples.push(
            sampleMark(
              (x + (sampleX + 0.5) * step) * (SIZE / size),
              (y + (sampleY + 0.5) * step) * (SIZE / size),
              markScale,
              pin,
              eye,
            ) ?? background,
          );
        }
      }
      const color = blend(samples);
      const offset = rowOffset + 1 + x * 4;
      scanlines[offset] = color[0];
      scanlines[offset + 1] = color[1];
      scanlines[offset + 2] = color[2];
      scanlines[offset + 3] = color[3];
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

function ensurePwaBrandAssets(projectRoot: string) {
  const directory = join(projectRoot, 'public', 'icons');
  const versionPath = join(directory, '.asset-version');
  const version = 'nomadalingo-pwa-v1';
  const definitions = [
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['icon-512-maskable.png', 512],
    ['apple-touch-icon.png', 180],
  ] as const;
  const assets: AssetOptions[] = definitions.map(([filename, size]) => ({
    path: join(directory, filename),
    size,
    background: COLORS.sand,
    eye: COLORS.ink,
    pin: COLORS.teal,
    markScale: 0.58,
  }));
  if (
    existsSync(versionPath) &&
    readFileSync(versionPath, 'utf8') === version &&
    assets.every(({ path }) => existsSync(path))
  )
    return;
  mkdirSync(directory, { recursive: true });
  for (const asset of assets) renderAsset(asset);
  writeFileSync(versionPath, version);
}

export function ensureNativeBrandAssets(projectRoot: string) {
  ensurePwaBrandAssets(projectRoot);
  const outputDirectory = join(projectRoot, 'assets', 'images', 'native-brand');
  const versionPath = join(outputDirectory, '.asset-version');
  const assets: AssetOptions[] = [
    {
      background: COLORS.sand,
      eye: COLORS.ink,
      markScale: 0.58,
      path: join(outputDirectory, 'icon.png'),
      pin: COLORS.teal,
    },
    {
      background: COLORS.transparent,
      eye: COLORS.ink,
      markScale: 0.46,
      path: join(outputDirectory, 'adaptive-foreground.png'),
      pin: COLORS.teal,
    },
    {
      background: COLORS.transparent,
      eye: COLORS.transparent,
      markScale: 0.46,
      path: join(outputDirectory, 'adaptive-monochrome.png'),
      pin: COLORS.white,
    },
    {
      background: COLORS.transparent,
      eye: COLORS.ink,
      markScale: 0.76,
      path: join(outputDirectory, 'splash.png'),
      pin: COLORS.teal,
    },
  ];

  const isCurrent =
    existsSync(versionPath) &&
    readFileSync(versionPath, 'utf8') === ASSET_VERSION &&
    assets.every(({ path }) => existsSync(path));
  if (isCurrent) return;

  mkdirSync(dirname(versionPath), { recursive: true });
  for (const asset of assets) renderAsset(asset);
  writeFileSync(versionPath, ASSET_VERSION);
}
