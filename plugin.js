/** @type {import('lighthouse').Config.Plugin} */
export default {
  audits: [
    {path: 'lighthouse-plugin-soft-navigation/audits/soft-nav-fcp'},
    {path: 'lighthouse-plugin-soft-navigation/audits/soft-nav-lcp'},
  ],
  groups: {
    'metrics': {
      title: 'Metrics associated with a soft navigation',
    }
  },
  category: {
    title: 'Soft Navigation',
    supportedModes: ['timespan'],
    auditRefs: [
      {id: 'soft-nav-fcp', weight: 1, group: 'metrics'},
      {id: 'soft-nav-lcp', weight: 1, group: 'metrics'},
    ]
  },
}