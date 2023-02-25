const fs = require('fs')
const path = require('path')
const argv = require('yargs')
  .usage('$0 [options]')

  .string('p')
  .alias('p', 'pr')
  .describe('p', 'The identifier of the PR, used to name the file')

  .string('h')
  .alias('h', 'heading')
  .describe('h', 'The heading of the changelog item (###)')

  .string('d')
  .alias('d', 'description')
  .describe('d', 'The description body of the changelog item')
  .argv

const { pr, heading, description } = argv
const nextDir = path.join(__dirname, '../src/next')
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir)
}

const fileContents = `### ${heading}
${description}`

fs.writeFileSync(`${nextDir}/${pr}.md`, fileContents, 'utf-8')
