import type { Violation } from '../types';
import type { SourceFacts } from './ast';

export interface SourceFile {
  /** Project-relative, forward slashes. */
  path: string;
  content: string;
  lines: string[];
  imports: Array<{ spec: string; line: number }>;
  /** What the syntax tree says about procedures, routes, jobs, events and context use. */
  facts: SourceFacts;
}

export interface Rule {
  name: string;
  description: string;
  check(files: SourceFile[], paths: Set<string>): Violation[];
}

export const isTest = (p: string) => /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(p) || /(^|\/)(?:__tests__|test|tests)\//.test(p);
