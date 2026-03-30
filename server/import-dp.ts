import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'flashcards.db');
const db = new Database(dbPath);

interface DPProblem {
  slug: string;
  title: string;
  description: string;
  category: string;
  stage1_answer: string;
  stage2_answer: string;
  stage3_answer: string;
  source_file: string;
}

function parseCategory(categoryString: string): string {
  // Input: [[Categories/3-Grid-DP]]
  // Output: Grid DP
  const match = categoryString.match(/\[\[Categories\/[\d]+-(.+?)\]\]/);
  if (!match) return categoryString;

  let name = match[1];
  // Replace dashes with spaces
  name = name.replace(/-/g, ' ');
  // Handle special case: N2 → N²
  name = name.replace(/N2/g, 'N²');
  return name;
}

function parseMarkdownFile(filePath: string): DPProblem | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = path.basename(filePath, '.md');
  const sourceFile = path.basename(filePath);

  // Split by first horizontal rule
  const parts = content.split(/^---\s*$/m);
  const beforeSeparator = parts[0];
  const afterSeparator = parts.slice(1).join('---');

  // Extract title (first # or ## heading)
  let title = '';
  const headingMatch = beforeSeparator.match(/^#+\s+(.+)$/m);
  if (headingMatch) {
    title = headingMatch[1].trim();
  }
  // If no heading found, derive from slug
  if (!title) {
    title = slug
      .replace(/-/g, ' ')
      .replace(/^\d+\s+/, '')
      .replace(/[()]/g, '');
  }

  // Extract description (everything before separator, minus title)
  let description = beforeSeparator;
  if (headingMatch) {
    // Remove the title heading from description
    description = description.replace(/^#+\s+.+\n/m, '').trim();
  }
  description = description.trim();

  // Extract category from after separator
  const categoryMatch = afterSeparator.match(/\*\*Category:\*\*\s*(\[\[Categories\/[^\]]+\]\])/);
  if (!categoryMatch) {
    console.warn(`Skipping ${sourceFile}: no category found`);
    return null;
  }
  const category = parseCategory(categoryMatch[1]);

  // Extract stage1_answer (category name)
  const stage1Answer = category;

  // Extract stage2_answer (A + B) and stage3_answer (C + D + E)
  // Supports ### A., ## A., and **A. formats
  let stage2Answer = '';
  let stage3Answer = '';

  // Try ### or ## heading format
  let s2 = afterSeparator.match(/(#{2,3}\s+A\..+?)(#{2,3}\s+C\.|$)/s);
  let s3 = afterSeparator.match(/(#{2,3}\s+C\..+)$/s);

  if (s2 && s2[1].trim()) {
    stage2Answer = s2[1].trim();
    stage3Answer = s3 ? s3[1].trim() : '';
  } else {
    // Try **A. bold format
    s2 = afterSeparator.match(/(\*\*A[\.\)].+?)(\*\*C[\.\)]|$)/s);
    s3 = afterSeparator.match(/(\*\*C[\.\)].+)$/s);
    if (s2) stage2Answer = s2[1].trim();
    if (s3) stage3Answer = s3[1].trim();
  }

  // If still empty, try ## Solution Approach with **A. inside
  if (!stage2Answer) {
    const solMatch = afterSeparator.match(/##\s+Solution.*?\n([\s\S]*)/);
    if (solMatch) {
      const solContent = solMatch[1];
      s2 = solContent.match(/(\*\*A[\.\)].+?)(\*\*C[\.\)]|$)/s);
      s3 = solContent.match(/(\*\*C[\.\)].+)$/s);
      if (s2) stage2Answer = s2[1].trim();
      if (s3) stage3Answer = s3[1].trim();
    }
  }

  if (!stage2Answer || !stage3Answer) {
    console.warn(`Skipping ${sourceFile}: missing stage2 or stage3 answers`);
    return null;
  }

  return {
    slug,
    title,
    description,
    category,
    stage1_answer: stage1Answer,
    stage2_answer: stage2Answer,
    stage3_answer: stage3Answer,
    source_file: sourceFile,
  };
}

function shouldSkipFile(filename: string): boolean {
  // Skip special files
  if (filename === '_Empty.md' || filename === '_Sources.md') {
    return true;
  }
  return false;
}

function shouldSkipDirectory(dirName: string): boolean {
  // Skip Categories/ and .claude/ directories
  if (dirName === 'Categories' || dirName === '.claude') {
    return true;
  }
  return false;
}

function importProblems(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dirPath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dirPath);
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    // Skip directories
    if (stat.isDirectory()) {
      if (shouldSkipDirectory(file)) {
        console.log(`Skipping directory: ${file}`);
      }
      continue;
    }

    // Only process markdown files
    if (!file.endsWith('.md')) {
      continue;
    }

    // Skip special files
    if (shouldSkipFile(file)) {
      console.log(`Skipping special file: ${file}`);
      skipped++;
      continue;
    }

    console.log(`Processing: ${file}`);
    const problem = parseMarkdownFile(fullPath);

    if (!problem) {
      skipped++;
      continue;
    }

    // Check if problem already exists
    const existing = db.prepare('SELECT id FROM dp_problems WHERE slug = ?').get(problem.slug);

    if (existing) {
      // Update
      db.prepare(`
        UPDATE dp_problems
        SET title = ?, description = ?, category = ?,
            stage1_answer = ?, stage2_answer = ?, stage3_answer = ?,
            source_file = ?
        WHERE slug = ?
      `).run(
        problem.title,
        problem.description,
        problem.category,
        problem.stage1_answer,
        problem.stage2_answer,
        problem.stage3_answer,
        problem.source_file,
        problem.slug
      );
      updated++;
      console.log(`  Updated: ${problem.slug}`);
    } else {
      // Insert
      db.prepare(`
        INSERT INTO dp_problems
        (slug, title, description, category, stage1_answer, stage2_answer, stage3_answer, source_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        problem.slug,
        problem.title,
        problem.description,
        problem.category,
        problem.stage1_answer,
        problem.stage2_answer,
        problem.stage3_answer,
        problem.source_file
      );
      imported++;
      console.log(`  Imported: ${problem.slug}`);
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Imported: ${imported}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total processed: ${imported + updated + skipped}`);
}

// Main
const dirPath = process.argv[2];
if (!dirPath) {
  console.error('Usage: npx tsx server/import-dp.ts /path/to/dp-repo');
  process.exit(1);
}

importProblems(dirPath);
