/**
 * The janitorial page, after the SEO audit of 11 Nov 2026 (13 Nov 2026):
 * geo N9 (question H2s, named products, a lead for "What is included", a
 * shorter opener) and sxo S1 (the page had no client proof).
 *
 * Read off the Markdown source, like tests/service-copy.test.ts: the build
 * suites already prove the page renders.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { reviews } from '../src/data/reviews';

const repo = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(repo, 'src/content/services/janitorial-services.md'), 'utf8');
const [, front, body] = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
const field = (name: string) => front.match(new RegExp(`^${name}: "([^"]*)"`, 'm'))?.[1] ?? '';
const h2s = [...body.matchAll(/^## (.+)$/gm)].map((h) => h[1].trim());
const sectionAfter = (h2: string) => body.split(`## ${h2}\n`)[1].split('\n## ')[0];

describe('body headings are questions (geo N9)', () => {
  it('asks the questions a buyer types', () => {
    expect(h2s).toEqual([
      'How often should janitorial service visit?',
      'How do janitorial services differ by building?',
      'Janitorial services or commercial cleaning?',
      'Who does the work, and when?',
      'Which cleaning products does Evergreen use?',
    ]);
  });

  it('keeps none of the old statement headings', () => {
    for (const old of ['How often janitorial service should visit', 'Janitorial services for different buildings', 'Products and safety'])
      expect(h2s).not.toContain(old);
  });
});

describe('products are named the way the office and commercial pages name them (geo N9)', () => {
  const products = sectionAfter('Which cleaning products does Evergreen use?');

  it('names the line and its certification', () => {
    expect(products).toMatch(/^\s*Evergreen Office Cleaning uses Armstrong Manufacturing's ProSeries Green line/);
    expect(products).toContain('third-party certified to UL Environment (ECOLOGO) standards, fragrance-free and free of VOCs');
    expect(products).toContain('](/green-clean-products/)');
    expect(products).not.toMatch(/an approved line/);
  });

  it('says nothing about the products that the commercial page does not', () => {
    const commercial = fs.readFileSync(path.join(repo, 'src/content/services/commercial-cleaning.md'), 'utf8');
    expect(commercial).toContain(
      "Armstrong Manufacturing's ProSeries Green line on its commercial contracts: products third-party certified to UL Environment (ECOLOGO) standards, fragrance-free and free of VOCs",
    );
  });
});

describe('the opener is short and loses no fact (geo N9)', () => {
  const summary = field('summary');

  it('is about 250 to 300 characters', () => {
    expect(summary.length).toBeGreaterThanOrEqual(250);
    expect(summary.length).toBeLessThanOrEqual(300);
  });

  it('moved the address, the same crew and "without anyone having to ask" into the body', () => {
    const who = sectionAfter('Who does the work, and when?');
    expect(who).toContain('one office, at 243 Queen St W');
    expect(who).toContain('the same crew comes back to the same building');
    expect(who).toContain('ready each morning without anyone having to ask');
    expect(who).toContain('after hours or at weekends');
  });

  it('kept the insurance and screening facts from "Products and safety"', () => {
    const who = sectionAfter('Who does the work, and when?');
    for (const fact of ['WSIB Ontario', 'liability insurance', 'bonded', 'background-screened']) expect(who).toContain(fact);
  });
});

describe('"What is included" has a lead sentence (geo N9)', () => {
  it('is set in the front matter, one sentence', () => {
    const lead = field('includedLead');
    expect(lead).toMatch(/^A janitorial visit from Evergreen covers/);
    expect(lead.match(/[.!?](\s|$)/g)).toHaveLength(1);
  });
});

describe('client proof (sxo S1)', () => {
  const chosen = [...front.matchAll(/^reviews:\n((?:\s+- "[^"]*"\n)+)/gm)]
    .flatMap((m) => [...m[1].matchAll(/"([^"]*)"/g)].map((n) => n[1]));

  it('quotes two real reviews, each one about recurring office upkeep', () => {
    expect(chosen).toEqual(['av-ev', 'Edward Sherman']);
    for (const name of chosen) {
      const review = reviews.find((r) => r.name === name);
      expect(review, name).toBeDefined();
      expect(review!.verified).toBe(true);
    }
    expect(reviews.find((r) => r.name === 'av-ev')!.text).toMatch(/regular maintenance of our office/);
    expect(reviews.find((r) => r.name === 'Edward Sherman')!.text).toMatch(/cleaning our offices for the past 3 years/);
  });

  it('adds no heading or attribution of its own around them', () => {
    expect(body).not.toMatch(/What clients say/);
    expect(front).not.toMatch(/^reviewHeading:/m);
  });
});
