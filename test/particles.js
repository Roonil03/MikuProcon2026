import assert from 'node:assert/strict';
import { it } from 'node:test';
import { snapshotTransition, transitionProgress } from '../src/lib/particleTransition.js';

it('particle progress clamps both ends of each transition', () => {
  for (const scatter of [false, true]) {
    assert.equal(transitionProgress(500, 1000, 2000, scatter), 0);
    assert.equal(transitionProgress(4000, 1000, 2000, scatter), 1);
  }
});
it('particle easing preserves the formation and scatter curves', () => {
  assert.equal(transitionProgress(2000, 1000, 2000, false), 0.875);
  assert.equal(transitionProgress(2000, 1000, 2000, true), 0.5);
});
it('snapshot preserves continuity when a transition changes targets', () => {
  const from = new Float32Array([0, 10, -30]);
  snapshotTransition(from, new Float32Array([20, 30, -10]), 0.5);
  assert.deepEqual([...from], [10, 20, -20]);
  snapshotTransition(from, new Float32Array([100, 0, 0]), 0);
  assert.deepEqual([...from], [10, 20, -20]);
});
