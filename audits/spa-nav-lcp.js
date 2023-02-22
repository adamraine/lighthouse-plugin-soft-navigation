import {Audit} from 'lighthouse';
import {ProcessedTrace} from 'lighthouse/core/computed/processed-trace.js';
import {computeMetricTimings} from '../lib/metric-timings.js';

/** @typedef {import('lighthouse/types/audit.js').default.Meta} AuditMeta */
/** @typedef {import('lighthouse/types/audit.js').default.Product} AuditProduct */
/** @typedef {import('lighthouse/types/audit.js').default.Context} AuditContext */

class SPANavLCP extends Audit {
  /**
   * @return {AuditMeta}
   */
  static get meta() {
    return {
      id: 'spa-nav-lcp',
      title: 'SPA Navigation Largest Contentful Paint',
      description: 'Largest Contentful Paint of a SPA navigation also known as a soft navigation.',
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      supportedModes: ['timespan'],
      requiredArtifacts: ['Trace'],
    };
  }

  /**
   * @param {import('lighthouse').Artifacts} artifacts 
   * @param {AuditContext} context 
   * @return {Promise<AuditProduct>}
   */
  static async audit(artifacts, context) {
    const trace = artifacts.Trace;
    const processedTrace = await ProcessedTrace.request(trace, context);
    
    const {lcpTiming} = computeMetricTimings(processedTrace.mainThreadEvents);
    if (!lcpTiming) {
      return {
        notApplicable: true,
        score: 1,
      }
    }
    
    return {
      numericValue: lcpTiming,
      numericUnit: 'millisecond',
      displayValue: `${lcpTiming} ms`,
      score: Audit.computeLogNormalScore({
        p10: 2500,
        median: 4000
      }, lcpTiming)
    }
  }
}

export default SPANavLCP;