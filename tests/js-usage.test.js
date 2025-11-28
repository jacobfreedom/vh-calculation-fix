import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import * as esm from '../dist/index.js';

const require = createRequire(import.meta.url);
const cjs = require('../dist/index.cjs');

describe('JS builds expose functions', () => {
  it('CJS build', () => {
    expect(typeof cjs.initViewportHeight).toBe('function');
    expect(typeof cjs.setViewportHeight).toBe('function');
    expect(typeof cjs.isInApp).toBe('function');
    expect(typeof cjs.computeHeights).toBe('function');
  });
  it('ESM build', () => {
    expect(typeof esm.initViewportHeight).toBe('function');
    expect(typeof esm.setViewportHeight).toBe('function');
    expect(typeof esm.isInApp).toBe('function');
    expect(typeof esm.computeHeights).toBe('function');
  });
});
