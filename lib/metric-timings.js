/**
 * This is a re-implementation of how Lighthouse's `ProcessedNavigation` gets these metrics.
 * In theory we could use `ProcessedNavigation` once it can find a soft nav's `timeOrigin`.
 *
 * @param {import('lighthouse').TraceEvent[]} traceEvents 
 * @return {{lcpTiming?: number, fcpTiming?: number}}
 */
export function computeMetricTimings(traceEvents) {
  /** @type {import('lighthouse').TraceEvent|undefined} */
  let timeOrigin;
  /** @type {import('lighthouse').TraceEvent|undefined} */
  let softNavEvent;
  /** @type {import('lighthouse').TraceEvent|undefined} */
  let lastLcpCandidate;
  /** @type {import('lighthouse').TraceEvent|undefined} */
  let fcpEvent;
  
  for (const event of traceEvents) {
    switch (event.name) {
      case 'SoftNavigationHeuristics::UserInitiatedClick':
        if (!softNavEvent) {
          timeOrigin = event;
        }
        break;
      case 'SoftNavigationHeuristics_SoftNavigationDetected':
        if (softNavEvent) throw new Error('Multiple soft navigations detected');
        softNavEvent = event;
        break;
      case 'largestContentfulPaint::Candidate':
        if (timeOrigin) {
          lastLcpCandidate = event;
        }
        break;
      case 'firstContentfulPaint':
        if (timeOrigin) {
          fcpEvent = event;
        }
        break;
    }
  }
  
  if (!timeOrigin) return {};
  const timeOriginTs = timeOrigin.ts;
  
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