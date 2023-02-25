const fs = require('fs')
const path = require('path')
const argv = require('yargs')
  .usage('$0 [options]')

  .string('p')
  .alias('p', 'pr')
  .describe('p', 'The PR number')

  .string('c')
  .alias('c', 'comment')
  .describe('h', 'The PR comment, extended descriptions are used to fill the body of the changelog item if present')

  .array('l')
  .alias('l', 'links')
  .describe('l', 'space delimited list of links to append at bottom of changelog item')

  .argv

const { pr, comment, links } = argv
const nextDir = path.join(__dirname, '../src/next')
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir)
}

const [heading, description] = comment.split('\\n\\n')

const fileContents = `### ${heading}\n${description || ''}

[Pull Request](https://github.com/newrelic/newrelic-browser-agent/pull/${pr})

${!!links && links.length ? links.join('\n\n') : ''}`.replace('\n\n\n', '\n\n')

fs.writeFileSync(`${nextDir}/${formatFilename(heading)}.md`, fileContents, 'utf-8')

function formatFilename (str) {
  return str.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}
