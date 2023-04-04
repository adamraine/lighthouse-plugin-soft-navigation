/**
 * This is a re-implementation of how Lighthouse's `ProcessedNavigation` gets these metrics.
 * In theory we could use `ProcessedNavigation` once it can find a soft nav's `timeOrigin`.
 *
 * @param {import('lighthouse').TraceEvent[]} traceEvents trace events sorted by `ts`
 * @return {{lcpTiming?: number, fcpTiming?: number}}
 */
export function computeMetricTimings(traceEvents) {
  /** @type {import('lighthouse').TraceEvent|undefined} */
  let softNavEvent;
  /** @type {import('lighthouse').TraceEvent|undefined} */
  let lastLcpCandidate;
  /** @type {import('lighthouse').TraceEvent|undefined} */
  let fcpEvent;
  
  for (const event of traceEvents) {
    switch (event.name) {
      case 'SoftNavigationHeuristics_SoftNavigationDetected':
        if (softNavEvent) throw new Error('Multiple soft navigations detected');
        softNavEvent = event;
        break;
      case 'largestContentfulPaint::Candidate':
        if (softNavEvent) {
          lastLcpCandidate = event;
        }
        break;
      case 'firstContentfulPaint':
        if (softNavEvent) {
          fcpEvent = event;
        }
        break;
    }
  }
  
  if (!softNavEvent) return {};
  const timeOriginTs = softNavEvent.ts;
  
  /**
   * @param {import('lighthouse').TraceEvent|undefined} event 
   * @return {number|undefined}
   */
  const getTiming = (event) => {
    if (!event) return undefined;
    return (event.ts - timeOriginTs) / 1000;
  }
  
  return {
    lcpTiming: getTiming(lastLcpCandidate),
    fcpTiming: getTiming(fcpEvent),
  }
}