import {Audit} from 'lighthouse';
import {ProcessedTrace} from 'lighthouse/core/computed/processed-trace.js';
import {computeMetricTimings} from '../lib/metric-timings.js';

/** @typedef {import('lighthouse/types/audit.js').default.Meta} AuditMeta */
/** @typedef {import('lighthouse/types/audit.js').default.Product} AuditProduct */
/** @typedef {import('lighthouse/types/audit.js').default.Context} AuditContext */

class SPANavFCP extends Audit {
  /**
   * @return {AuditMeta}
   */
  static get meta() {
    return {
      id: 'spa-nav-fcp',
      title: 'SPA Navigation First Contentful Paint',
      description: 'First Contentful Paint of a SPA navigation also known as a soft navigation.',
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
    
    const {fcpTiming} = computeMetricTimings(processedTrace);
    if (!fcpTiming) {
      return {
        notApplicable: true,
        score: 1,
      }
    }
    
    return {
      numericValue: fcpTiming,
      numericUnit: 'millisecond',
      displayValue: `${fcpTiming} ms`,
      score: Audit.computeLogNormalScore({
        p10: 1800,
        median: 3000
      }, fcpTiming)
    }
  }
}

export default SPANavFCP;