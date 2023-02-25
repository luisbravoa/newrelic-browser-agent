var argv = require('yargs')
  .usage('$0 [options]')

  .string('v')
  .describe('v', 'The v')

const { env, appId, licenseKey, bucket, role, current, next, dry, sha, workflow } = argv