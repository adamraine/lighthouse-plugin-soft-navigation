/** @type {import('lighthouse').Config} */
export default {
  extends: 'lighthouse:default',
  plugins: ['lighthouse-plugin-spa'],
  
  settings: {
    additionalTraceCategories: 'scheduler',
  },
}