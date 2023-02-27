const fs = require('fs')
const path = require('path')
const argv = require('yargs')
  .usage('$0 [options]')

  .string('p')
  .alias('p', 'pr')
  .describe('p', 'The PR number')

  .string('c')
  .alias('c', 'comment')
  .describe('c', 'The PR comment, extended descriptions are used to fill the body of the changelog item if present')
  .default('c', '')

  .argv

const { pr, comment } = argv
if (!pr) {
  console.log('Event ID (PR number) must be included')
  process.exit(1)
}

const nextDir = path.join(__dirname, '../src/next')
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir)
}

let [heading, ...description] = comment.split('\\n\\n')
heading = heading || `PR-${pr}`
description = description?.map(x => x.split('\\n')).flat().filter(x => x) || ['']

const fileContents = `### ${heading}\n${description.join('\n\n')}

[Pull Request](https://github.com/newrelic/newrelic-browser-agent/pull/${pr})`.replace('\n\n\n', '\n\n')

fs.writeFileSync(`${nextDir}/${formatFilename(heading)}.md`, fileContents, 'utf-8')

function formatFilename (str) {
  return str.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}
