/** @type {import('lighthouse').Config.Plugin} */
export default {
  audits: [
    {path: 'lighthouse-plugin-spa/audits/spa-nav-fcp.js'},
    {path: 'lighthouse-plugin-spa/audits/spa-nav-lcp.js'},
  ],
  groups: {
    'metrics': {
      title: 'Metrics associated with a SPA navigation',
    }
  },
  category: {
    title: 'SPA',
    supportedModes: ['timespan'],
    auditRefs: [
      {id: 'spa-nav-fcp', weight: 1, group: 'metrics'},
      {id: 'spa-nav-lcp', weight: 1, group: 'metrics'},
    ]
  },
}