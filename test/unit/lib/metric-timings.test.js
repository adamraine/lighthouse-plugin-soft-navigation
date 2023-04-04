import assert from 'assert';
import {computeMetricTimings} from '../../../lib/metric-timings.js';

/** @typedef {import('lighthouse').TraceEvent} TraceEvent */

/**
 * @param {Partial<TraceEvent> & {name: string, ts: number}} event
 * @return {TraceEvent}
 */
function traceEvent(event) {
  return {
    args: {},
    cat: 'devtools.timeline',
    pid: 111,
    tid: 2222,
    dur: 50,
    ph: 'X',
    ...event,
  }
}

describe('computeMetricTimings', () => {
  it('computes the soft navigation fcp and lcp', () => {
    /** @type {TraceEvent[]} */
    const traceEvents = [
      traceEvent({name: 'SoftNavigationHeuristics_SoftNavigationDetected', ts: 1_000_000}),
      traceEvent({name: 'firstContentfulPaint', ts: 1_080_000}),
      traceEvent({name: 'largestContentfulPaint::Candidate', ts: 1_090_000}),
    ];
    
    const timings = computeMetricTimings(traceEvents);
    
    assert.strictEqual(timings.fcpTiming, 80);
    assert.strictEqual(timings.lcpTiming, 90);
  });

  it('returns undefined for missing lcp', () => {
    /** @type {TraceEvent[]} */
    const traceEvents = [
      traceEvent({name: 'SoftNavigationHeuristics_SoftNavigationDetected', ts: 1_000_000}),
      traceEvent({name: 'firstContentfulPaint', ts: 1_090_000}),
    ];
    
    const timings = computeMetricTimings(traceEvents);
    
    assert.strictEqual(timings.fcpTiming, 90);
    assert.strictEqual(timings.lcpTiming, undefined);
  });

  it('returns undefined for missing fcp', () => {
    /** @type {TraceEvent[]} */
    const traceEvents = [
      traceEvent({name: 'SoftNavigationHeuristics_SoftNavigationDetected', ts: 1_000_000}),
    ];
    
    const timings = computeMetricTimings(traceEvents);
    
    assert.strictEqual(timings.fcpTiming, undefined);
    assert.strictEqual(timings.lcpTiming, undefined);
  });

  it('throws if multiple soft navigations are found', () => {
    /** @type {TraceEvent[]} */
    const traceEvents = [
      traceEvent({name: 'SoftNavigationHeuristics_SoftNavigationDetected', ts: 1_000_000}),
      traceEvent({name: 'firstContentfulPaint', ts: 1_090_000}),
      traceEvent({name: 'largestContentfulPaint::Candidate', ts: 1_090_000}),
      traceEvent({name: 'SoftNavigationHeuristics_SoftNavigationDetected', ts: 2_000_000}),
      traceEvent({name: 'firstContentfulPaint', ts: 2_090_000}),
      traceEvent({name: 'largestContentfulPaint::Candidate', ts: 2_090_000}),
    ];
    
    assert.throws(() => computeMetricTimings(traceEvents), new Error('Multiple soft navigations detected'));
  });

  it('ignores metric timings before soft navigation detected', () => {
    /** @type {TraceEvent[]} */
    const traceEvents = [
      traceEvent({name: 'firstContentfulPaint', ts: 1_020_000}),
      traceEvent({name: 'largestContentfulPaint::Candidate', ts: 1_030_000}),
      traceEvent({name: 'SoftNavigationHeuristics_SoftNavigationDetected', ts: 1_050_000}),
      traceEvent({name: 'firstContentfulPaint', ts: 1_090_000}),
      traceEvent({name: 'largestContentfulPaint::Candidate', ts: 1_090_000}),
    ];
    
    const timings = computeMetricTimings(traceEvents);
    
    assert.strictEqual(timings.fcpTiming, 40);
    assert.strictEqual(timings.lcpTiming, 40);
  });
});