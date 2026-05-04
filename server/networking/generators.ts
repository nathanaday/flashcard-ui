import {
  randInt,
  randChoice,
  classOfIp,
  classNetworkBits,
  classHostBits,
  randomIpInClass,
  ipToString,
  ipToInt,
  intToIp,
  ipToBinary,
  maskFromPrefix,
  applyMask,
  ipEquals,
  isPrivateIp,
  type Ip,
  type IpClass,
} from './util.js';

export type NetworkingFamily =
  | 'class_id'
  | 'host_count'
  | 'public_private'
  | 'subnet_bits'
  | 'subnet_enum'
  | 'subnet_range'
  | 'subnet_mask'
  | 'subnet_and'
  | 'same_subnet'
  | 'cidr_count'
  | 'cidr_range'
  | 'cidr_equiv';

export interface GeneratedProblem {
  family: NetworkingFamily;
  generator: string;
  question: string;
  answer: string;
}

interface GeneratorDef {
  slug: string;
  label: string;
  run: () => GeneratedProblem;
}

interface FamilyDef {
  label: string;
  description: string;
  generators: GeneratorDef[];
}

const CLASSES: readonly IpClass[] = ['A', 'B', 'C'] as const;

// ---------- Family 1: IP Class Identification ----------

function genClassIdBasic(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const ip = randomIpInClass(cls);
  return {
    family: 'class_id',
    generator: 'class_id_basic',
    question: `What class is \`${ipToString(ip)}\`?`,
    answer: `Class **${cls}** (first octet ${ip.a} falls in ${cls === 'A' ? '1–126' : cls === 'B' ? '128–191' : '192–223'}).`,
  };
}

// ---------- Family 2: Host Count ----------

function genHostCountBasic(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const hostBits = classHostBits(cls);
  const hosts = 2 ** hostBits - 2;
  return {
    family: 'host_count',
    generator: 'host_count_basic',
    question: `How many usable host addresses can a Class ${cls} network support?`,
    answer: `$2^{${hostBits}} - 2 = ${hosts.toLocaleString()}$ hosts. (Subtract 2 for the network and broadcast addresses.)`,
  };
}

function genHostCountSneaky(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const hostBits = classHostBits(cls);
  const capacity = 2 ** hostBits - 2;
  // Pick a hosts value that straddles the capacity to make the question interesting.
  const needed = randChoice([capacity - 1, capacity, capacity + 1, Math.floor(capacity * 1.5)]);
  const fits = needed <= capacity;
  return {
    family: 'host_count',
    generator: 'host_count_sneaky',
    question: `You need to support ${needed.toLocaleString()} hosts. Will a Class ${cls} network do it?`,
    answer: `${fits ? '**Yes**' : '**No**'}. Class ${cls} supports $2^{${hostBits}} - 2 = ${capacity.toLocaleString()}$ hosts, which is ${fits ? '≥' : '<'} ${needed.toLocaleString()}.`,
  };
}

// ---------- Family 3: Public vs Private ----------

function randomPrivateIp(): Ip {
  const region = randChoice(['10', '172', '192'] as const);
  if (region === '10') return { a: 10, b: randInt(0, 255), c: randInt(0, 255), d: randInt(0, 255) };
  if (region === '172') return { a: 172, b: randInt(16, 31), c: randInt(0, 255), d: randInt(0, 255) };
  return { a: 192, b: 168, c: randInt(0, 255), d: randInt(0, 255) };
}

function genPublicPrivateClassify(): GeneratedProblem {
  // Half the time generate a private IP, half a random public IP.
  const ip = Math.random() < 0.5 ? randomPrivateIp() : randomIpInClass(randChoice(CLASSES));
  const priv = isPrivateIp(ip);
  let reason: string;
  if (priv) {
    if (ip.a === 10) reason = '10.0.0.0–10.255.255.255 (Class A private block)';
    else if (ip.a === 172) reason = '172.16.0.0–172.31.255.255 (Class B private block)';
    else reason = '192.168.0.0–192.168.255.255 (Class C private block)';
  } else {
    reason = 'outside all three RFC 1918 private ranges';
  }
  return {
    family: 'public_private',
    generator: 'public_private_classify',
    question: `Is \`${ipToString(ip)}\` a private or public address?`,
    answer: `**${priv ? 'Private' : 'Public'}** — ${reason}.`,
  };
}

function genPublicPrivateCountNetworks(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const counts: Record<IpClass, { count: number; range: string }> = {
    A: { count: 1, range: '10.0.0.0/8' },
    B: { count: 16, range: '172.16.0.0 – 172.31.0.0 (/16 each)' },
    C: { count: 256, range: '192.168.0.0 – 192.168.255.0 (/24 each)' },
  };
  const { count, range } = counts[cls];
  return {
    family: 'public_private',
    generator: 'public_private_count',
    question: `How many private Class ${cls} networks exist (RFC 1918)?`,
    answer: `**${count}** — ${range}.`,
  };
}

// ---------- Family 4: Subnet Bits ----------

function pickSubnetCount(cls: IpClass): { subnetCount: number; subnetBits: number } {
  const hostBits = classHostBits(cls);
  // Need at least 2 host bits remaining (for network + broadcast + usable).
  const maxSubnetBits = hostBits - 2;
  const subnetBits = randInt(2, Math.min(maxSubnetBits, 10));
  return { subnetCount: 2 ** subnetBits, subnetBits };
}

function genSubnetBitsBasic(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const { subnetCount, subnetBits } = pickSubnetCount(cls);
  const hostBits = classHostBits(cls) - subnetBits;
  const hostsPerSubnet = 2 ** hostBits - 2;
  const baseIp = randomIpInClass(cls);
  // Zero out the host portion so the base address is a classful network address.
  const netBitsCount = classNetworkBits(cls);
  const baseInt = ipToInt(baseIp) & (((0xffffffff << (32 - netBitsCount)) >>> 0));
  return {
    family: 'subnet_bits',
    generator: 'subnet_bits_basic',
    question: `Divide \`${ipToString(intToIp(baseInt))}\` (Class ${cls}) into ${subnetCount} subnets. How many bits are borrowed, how many host bits remain, and how many usable hosts per subnet?`,
    answer: `Borrow **${subnetBits} bits** ($2^{${subnetBits}} = ${subnetCount}$).  \nRemaining host bits: ${classHostBits(cls)} − ${subnetBits} = **${hostBits}**.  \nHosts per subnet: $2^{${hostBits}} - 2 = ${hostsPerSubnet.toLocaleString()}$.`,
  };
}

// ---------- Family 5: Subnet Enumeration ----------

function genSubnetEnumList(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const { subnetCount, subnetBits } = pickSubnetCount(cls);
  const baseIp = randomIpInClass(cls);
  const netBits = classNetworkBits(cls);
  const baseInt = ipToInt(baseIp) & (((0xffffffff << (32 - netBits)) >>> 0));
  const jump = 2 ** (32 - netBits - subnetBits);
  const listCount = Math.min(subnetCount, 4);
  const subnets = Array.from({ length: listCount }, (_, i) => ipToString(intToIp(baseInt + i * jump)));
  const lastIdx = subnetCount - 1;
  const lastSubnet = ipToString(intToIp(baseInt + lastIdx * jump));
  return {
    family: 'subnet_enum',
    generator: 'subnet_enum_list',
    question: `Network \`${ipToString(intToIp(baseInt))}\` (Class ${cls}) is divided into ${subnetCount} subnets (${subnetBits} subnet bits). List the first ${listCount} subnet addresses and the last subnet address.`,
    answer: `Jump between subnets: $2^{32 - ${netBits} - ${subnetBits}} = ${jump.toLocaleString()}$ (in integer form).\n\nFirst ${listCount}: ${subnets.map(s => `\`${s}\``).join(', ')}\n\nLast (#${subnetCount}): \`${lastSubnet}\`.`,
  };
}

function genSubnetEnumNth(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const { subnetCount, subnetBits } = pickSubnetCount(cls);
  const baseIp = randomIpInClass(cls);
  const netBits = classNetworkBits(cls);
  const baseInt = ipToInt(baseIp) & (((0xffffffff << (32 - netBits)) >>> 0));
  const jump = 2 ** (32 - netBits - subnetBits);
  const n = randInt(2, Math.min(subnetCount, 16));
  const nth = ipToString(intToIp(baseInt + (n - 1) * jump));
  return {
    family: 'subnet_enum',
    generator: 'subnet_enum_nth',
    question: `Network \`${ipToString(intToIp(baseInt))}\` (Class ${cls}) is divided into ${subnetCount} subnets. What is the address of the **${n}${ordSuffix(n)} subnet**?`,
    answer: `Jump = $2^{${32 - netBits - subnetBits}} = ${jump.toLocaleString()}$. The ${n}${ordSuffix(n)} subnet address is \`${nth}\`.`,
  };
}

function ordSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// ---------- Family 6: Subnet Range (First/Last Host + Broadcast) ----------

function genSubnetRangeBasic(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const { subnetCount, subnetBits } = pickSubnetCount(cls);
  const baseIp = randomIpInClass(cls);
  const netBits = classNetworkBits(cls);
  const baseInt = ipToInt(baseIp) & (((0xffffffff << (32 - netBits)) >>> 0));
  const jump = 2 ** (32 - netBits - subnetBits);
  const idx = randInt(0, subnetCount - 1);
  const subnetInt = baseInt + idx * jump;
  const hostBits = 32 - netBits - subnetBits;
  const broadcastInt = subnetInt + 2 ** hostBits - 1;
  return {
    family: 'subnet_range',
    generator: 'subnet_range_basic',
    question: `On subnet \`${ipToString(intToIp(subnetInt))}\` (Class ${cls}, ${subnetBits} subnet bits, ${hostBits} host bits), what are the first usable host, last usable host, and broadcast address?`,
    answer: `First usable: \`${ipToString(intToIp(subnetInt + 1))}\`  \nLast usable: \`${ipToString(intToIp(broadcastInt - 1))}\`  \nBroadcast: \`${ipToString(intToIp(broadcastInt))}\``,
  };
}

// ---------- Family 7: Subnet Mask ----------

function genSubnetMaskFromScheme(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const { subnetBits } = pickSubnetCount(cls);
  const prefix = classNetworkBits(cls) + subnetBits;
  const mask = maskFromPrefix(prefix);
  return {
    family: 'subnet_mask',
    generator: 'subnet_mask_scheme',
    question: `Write the subnet mask for a Class ${cls} network using ${subnetBits} subnet bits. Give both binary and dotted-decimal forms.`,
    answer: `Prefix = ${classNetworkBits(cls)} + ${subnetBits} = /${prefix}.  \nBinary: \`${ipToBinary(mask)}\`  \nDecimal: \`${ipToString(mask)}\``,
  };
}

function genSubnetMaskFromPrefix(): GeneratedProblem {
  const prefix = randInt(8, 30);
  const mask = maskFromPrefix(prefix);
  return {
    family: 'subnet_mask',
    generator: 'subnet_mask_prefix',
    question: `Write \`/${prefix}\` as a dotted-decimal subnet mask.`,
    answer: `Binary: \`${ipToBinary(mask)}\`  \nDecimal: \`${ipToString(mask)}\``,
  };
}

// ---------- Family 8: Logical AND ----------

function genSubnetAnd(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const { subnetBits } = pickSubnetCount(cls);
  const prefix = classNetworkBits(cls) + subnetBits;
  const mask = maskFromPrefix(prefix);
  const ip = randomIpInClass(cls);
  const result = applyMask(ip, mask);
  return {
    family: 'subnet_and',
    generator: 'subnet_and_basic',
    question: `Compute the subnet ID by bitwise AND.  \nIP: \`${ipToString(ip)}\`  \nMask: \`${ipToString(mask)}\` (/${prefix})`,
    answer: `Per-octet AND:  \n\`${ip.a} & ${mask.a} = ${result.a}\`  \n\`${ip.b} & ${mask.b} = ${result.b}\`  \n\`${ip.c} & ${mask.c} = ${result.c}\`  \n\`${ip.d} & ${mask.d} = ${result.d}\`  \n\nSubnet ID: \`${ipToString(result)}\``,
  };
}

// ---------- Family 9: Same-Subnet Determination ----------

function genSameSubnet(): GeneratedProblem {
  const cls = randChoice(CLASSES);
  const { subnetBits } = pickSubnetCount(cls);
  const prefix = classNetworkBits(cls) + subnetBits;
  const mask = maskFromPrefix(prefix);
  const shouldMatch = Math.random() < 0.5;

  const ipA = randomIpInClass(cls);
  let ipB: Ip;
  if (shouldMatch) {
    // Copy subnet bits from A, randomize host bits.
    const hostBits = 32 - prefix;
    const subnetPart = ipToInt(applyMask(ipA, mask));
    const hostMax = 2 ** hostBits;
    ipB = intToIp(subnetPart + randInt(0, hostMax - 1));
  } else {
    // Generate another IP and nudge it off subnet if it happens to match.
    ipB = randomIpInClass(cls);
    if (ipEquals(applyMask(ipA, mask), applyMask(ipB, mask))) {
      const jump = 2 ** (32 - prefix);
      ipB = intToIp((ipToInt(ipB) + jump) >>> 0);
    }
  }

  const subA = applyMask(ipA, mask);
  const subB = applyMask(ipB, mask);
  const same = ipEquals(subA, subB);
  return {
    family: 'same_subnet',
    generator: 'same_subnet_basic',
    question: `Are hosts \`${ipToString(ipA)}\` and \`${ipToString(ipB)}\` on the same subnet under mask \`${ipToString(mask)}\` (/${prefix})?`,
    answer: `A AND Mask = \`${ipToString(subA)}\`  \nB AND Mask = \`${ipToString(subB)}\`  \n\n**${same ? 'Same subnet' : 'Different subnets'}** — ${same ? 'A can reach B directly (no router needed).' : 'A must forward through its default gateway to reach B.'}`,
  };
}

// ---------- Family 10: CIDR Addressable Devices ----------

function genCidrCount(): GeneratedProblem {
  const prefix = randInt(8, 30);
  const blockSize = 2 ** (32 - prefix);
  const usable = blockSize - 2;
  return {
    family: 'cidr_count',
    generator: 'cidr_count_basic',
    question: `How many addressable (usable) devices does a \`/${prefix}\` block support?`,
    answer: `Block size: $2^{32 - ${prefix}} = ${blockSize.toLocaleString()}$ addresses.  \nUsable: $2^{${32 - prefix}} - 2 = ${usable.toLocaleString()}$.`,
  };
}

// ---------- Family 11: CIDR First/Last Address ----------

function genCidrRange(): GeneratedProblem {
  const prefix = randInt(12, 30);
  // Align a random IP down to the block boundary.
  const raw = randomIpInClass(randChoice(CLASSES));
  const mask = maskFromPrefix(prefix);
  const firstInt = ipToInt(applyMask(raw, mask));
  const lastInt = firstInt + 2 ** (32 - prefix) - 1;
  return {
    family: 'cidr_range',
    generator: 'cidr_range_basic',
    question: `For the block \`${ipToString(intToIp(firstInt))}/${prefix}\`, what is the first (network) address and last (broadcast) address?`,
    answer: `Host bits = 32 − ${prefix} = ${32 - prefix}.  \nFirst: \`${ipToString(intToIp(firstInt))}\`  \nLast: \`${ipToString(intToIp(lastInt))}\``,
  };
}

// ---------- Family 12: CIDR Equivalences ----------

function genCidrEquiv(): GeneratedProblem {
  const prefix = randInt(8, 28);
  const total = 2 ** (32 - prefix);
  const classCEquivalent = total / 256;
  const fractionOfClassB = total / (2 ** 16);
  let detail: string;
  if (classCEquivalent >= 1) {
    detail = `= **${classCEquivalent.toLocaleString()} Class C networks** (each is $2^8 = 256$ addresses).`;
  } else {
    detail = `= **1/${256 / total} of a Class C network**.`;
  }
  const classBLine = prefix <= 16
    ? `That's ${fractionOfClassB === 1 ? 'exactly' : fractionOfClassB.toLocaleString() + '×'} a Class B.`
    : `That's 1/${(1 / fractionOfClassB).toLocaleString()} of a Class B.`;
  return {
    family: 'cidr_equiv',
    generator: 'cidr_equiv_basic',
    question: `\`/${prefix}\` is equivalent to how many addresses and how many Class C networks?`,
    answer: `$2^{32 - ${prefix}} = ${total.toLocaleString()}$ addresses.  \n${detail}  \n${classBLine}`,
  };
}

// ---------- Registry ----------

export const FAMILIES: Record<NetworkingFamily, FamilyDef> = {
  class_id: {
    label: 'IP Address Class Identification',
    description: 'Given an IP, identify Class A/B/C from the first octet.',
    generators: [
      { slug: 'class_id_basic', label: 'Basic classify', run: genClassIdBasic },
    ],
  },
  host_count: {
    label: 'Host Count for a Classful Network',
    description: 'Compute max usable hosts (2^hostBits − 2) for a given class.',
    generators: [
      { slug: 'host_count_basic', label: 'Basic count', run: genHostCountBasic },
      { slug: 'host_count_sneaky', label: 'Fit N hosts?', run: genHostCountSneaky },
    ],
  },
  public_private: {
    label: 'Public vs Private IP',
    description: 'Classify IPs against the three RFC 1918 ranges.',
    generators: [
      { slug: 'public_private_classify', label: 'Classify an IP', run: genPublicPrivateClassify },
      { slug: 'public_private_count', label: 'Count private nets', run: genPublicPrivateCountNetworks },
    ],
  },
  subnet_bits: {
    label: 'Subnetting — Bits and Host Counts',
    description: 'Determine bits to borrow, remaining host bits, and hosts per subnet.',
    generators: [
      { slug: 'subnet_bits_basic', label: 'Divide into N subnets', run: genSubnetBitsBasic },
    ],
  },
  subnet_enum: {
    label: 'Subnetting — Enumerate Subnets',
    description: 'List subnet network addresses given a subnetting scheme.',
    generators: [
      { slug: 'subnet_enum_list', label: 'List first N', run: genSubnetEnumList },
      { slug: 'subnet_enum_nth', label: 'Nth subnet', run: genSubnetEnumNth },
    ],
  },
  subnet_range: {
    label: 'Subnetting — First/Last Host on a Subnet',
    description: 'Identify first usable, last usable, and broadcast on a subnet.',
    generators: [
      { slug: 'subnet_range_basic', label: 'Host range', run: genSubnetRangeBasic },
    ],
  },
  subnet_mask: {
    label: 'Subnet Mask Calculation',
    description: 'Write subnet masks in binary and dotted-decimal.',
    generators: [
      { slug: 'subnet_mask_scheme', label: 'From scheme', run: genSubnetMaskFromScheme },
      { slug: 'subnet_mask_prefix', label: 'From /prefix', run: genSubnetMaskFromPrefix },
    ],
  },
  subnet_and: {
    label: 'Logical AND — Subnet ID',
    description: 'Apply a bitwise AND between an IP and a mask to extract subnet ID.',
    generators: [
      { slug: 'subnet_and_basic', label: 'IP AND Mask', run: genSubnetAnd },
    ],
  },
  same_subnet: {
    label: 'Same-Subnet Determination',
    description: 'Decide whether two IPs share a subnet under a given mask.',
    generators: [
      { slug: 'same_subnet_basic', label: 'Compare two IPs', run: genSameSubnet },
    ],
  },
  cidr_count: {
    label: 'CIDR — Addressable Devices',
    description: 'Compute block size and usable addresses from a CIDR prefix.',
    generators: [
      { slug: 'cidr_count_basic', label: 'Count devices', run: genCidrCount },
    ],
  },
  cidr_range: {
    label: 'CIDR — First and Last Address',
    description: 'Find network and broadcast addresses of a CIDR block.',
    generators: [
      { slug: 'cidr_range_basic', label: 'Block range', run: genCidrRange },
    ],
  },
  cidr_equiv: {
    label: 'CIDR Equivalences',
    description: 'Translate between CIDR prefix lengths and classful sizes.',
    generators: [
      { slug: 'cidr_equiv_basic', label: 'Prefix → classes', run: genCidrEquiv },
    ],
  },
};

export function familyList(): NetworkingFamily[] {
  return Object.keys(FAMILIES) as NetworkingFamily[];
}

export function generateForFamily(family: NetworkingFamily, count: number): GeneratedProblem[] {
  const def = FAMILIES[family];
  if (!def) throw new Error(`Unknown family: ${family}`);
  const out: GeneratedProblem[] = [];
  // Cycle through sub-generators so every sub-variant gets represented.
  for (let i = 0; i < count; i++) {
    const gen = def.generators[i % def.generators.length];
    out.push(gen.run());
  }
  // Shuffle so sub-variants aren't in lockstep order.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
