// Shared helpers for procedural networking problem generators.

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type IpClass = 'A' | 'B' | 'C';

export function classOfIp(firstOctet: number): IpClass | 'D' | 'E' | 'special' {
  if (firstOctet === 0 || firstOctet === 127) return 'special';
  if (firstOctet <= 127) return 'A';
  if (firstOctet <= 191) return 'B';
  if (firstOctet <= 223) return 'C';
  if (firstOctet <= 239) return 'D';
  return 'E';
}

export function classNetworkBits(cls: IpClass): number {
  return cls === 'A' ? 8 : cls === 'B' ? 16 : 24;
}

export function classHostBits(cls: IpClass): number {
  return 32 - classNetworkBits(cls);
}

export function firstOctetForClass(cls: IpClass): number {
  if (cls === 'A') return randInt(1, 126);
  if (cls === 'B') return randInt(128, 191);
  return randInt(192, 223);
}

export interface Ip { a: number; b: number; c: number; d: number; }

export function randomIpInClass(cls: IpClass): Ip {
  return {
    a: firstOctetForClass(cls),
    b: randInt(0, 255),
    c: randInt(0, 255),
    d: randInt(0, 255),
  };
}

export function ipToString(ip: Ip): string {
  return `${ip.a}.${ip.b}.${ip.c}.${ip.d}`;
}

export function ipToInt(ip: Ip): number {
  // Use *2^24 to avoid sign-bit issues (bit shifts would make the high bit negative in JS).
  return ip.a * 0x1000000 + (ip.b << 16) + (ip.c << 8) + ip.d;
}

export function intToIp(n: number): Ip {
  return {
    a: Math.floor(n / 0x1000000) & 0xff,
    b: (n >>> 16) & 0xff,
    c: (n >>> 8) & 0xff,
    d: n & 0xff,
  };
}

export function octetToBinary(octet: number): string {
  return octet.toString(2).padStart(8, '0');
}

export function ipToBinary(ip: Ip): string {
  return [ip.a, ip.b, ip.c, ip.d].map(octetToBinary).join('.');
}

export function maskFromPrefix(prefix: number): Ip {
  // prefix 1-bits in the high-order positions of a 32-bit mask
  if (prefix === 0) return { a: 0, b: 0, c: 0, d: 0 };
  const maskInt = (0xffffffff << (32 - prefix)) >>> 0;
  return intToIp(maskInt);
}

export function prefixFromMask(mask: Ip): number {
  const bin = ipToBinary(mask).replace(/\./g, '');
  return bin.indexOf('0') === -1 ? 32 : bin.indexOf('0');
}

export function applyMask(ip: Ip, mask: Ip): Ip {
  return {
    a: ip.a & mask.a,
    b: ip.b & mask.b,
    c: ip.c & mask.c,
    d: ip.d & mask.d,
  };
}

export function ipEquals(a: Ip, b: Ip): boolean {
  return a.a === b.a && a.b === b.b && a.c === b.c && a.d === b.d;
}

// Common private ranges: classful block boundaries from RFC 1918.
export function isPrivateIp(ip: Ip): boolean {
  if (ip.a === 10) return true;
  if (ip.a === 172 && ip.b >= 16 && ip.b <= 31) return true;
  if (ip.a === 192 && ip.b === 168) return true;
  return false;
}

// The smallest power of 2 that is >= n. Returns exponent.
export function ceilLog2(n: number): number {
  let bits = 0;
  let val = 1;
  while (val < n) {
    val *= 2;
    bits++;
  }
  return bits;
}
