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
  const fileNames = await fs.promises.readdir(nextDir)
  const fileContents = await Promise.all(fileNames.map(f => fs.promises.readFile(`${nextDir}/${f}`, 'utf-8')))

  const releaseBody = `##${ver}
  
${fileContents.join('\n')}`

  await fs.promises.rename(nextDir, path.join(__dirname, `../src/${ver}`))
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir)
  }
}

run()

// fs.writeFileSync(`${nextDir}/${pr}.md`, fileContents, 'utf-8')
