const fs = require('fs')
const path = require('path')
const argv = require('yargs')
  .usage('$0 [options]')

  .string('p')
  .alias('p', 'pr')
  .describe('p', 'The PR number')

  .string('h')
  .alias('h', 'heading')
  .describe('h', 'The heading of the changelog item (###)')

  .string('d')
  .alias('d', 'description')
  .describe('d', 'The description body of the changelog item')

  .array('l')
  .alias('l', 'links')
  .describe('l', 'space delimited list of links to append at bottom of changelog item')

  .argv

const { pr, heading, description, links } = argv
const nextDir = path.join(__dirname, '../src/next')
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir)
}

const fileContents = `### ${heading}
${description}  

[Pull Request](https://github.com/newrelic/newrelic-browser-agent/pull/${pr})

${!!links && links.length ? links.join('\n\n') : ''}`

fs.writeFileSync(`${nextDir}/${formatFilename(heading)}.md`, fileContents, 'utf-8')

function formatFilename (str) {
  return str.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}
