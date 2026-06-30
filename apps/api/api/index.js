// Vercel serverless function entry. Plain JS so Vercel's per-function bundler never
// has to resolve the app's "@/" path alias — it imports the already-compiled output
// (dist/src/serverless.js), where nest build has rewritten "@/" to relative paths.
module.exports = require('../dist/src/serverless.js').default;
