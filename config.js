/** @type {import('lighthouse').Config} */
export default {
  extends: 'lighthouse:default',
  plugins: ['lighthouse-plugin-soft-navigation'],
  
  settings: {
    additionalTraceCategories: 'scheduler',
  },
}