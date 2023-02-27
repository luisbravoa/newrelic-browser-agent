const fs = require('fs')
const path = require('path')
const argv = require('yargs')
  .usage('$0 [options]')

  .string('v')
  .alias('v', 'ver')
  .describe('v', 'The version number of the subsequent release')

  .argv

const { ver } = argv
const nextDir = path.join(__dirname, '../src/next')

async function run () {
  await fs.promises.rename(nextDir, path.join(__dirname, `../src/${ver}`))
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir)
  }
}

run()
