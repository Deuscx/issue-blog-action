import { Octokit } from '@octokit/rest'
import * as dotenv from 'dotenv'
import * as github from '@actions/github'
import fs from 'fs-extra'
import * as exec from '@actions/exec'
import { debug } from '@actions/core'
import { getInput } from './utils'

dotenv.config()

const {
  GH_TOKEN: token,
} = process.env
// get Input
const output = getInput('output') || 'blog-output'
const branch = getInput('branch') || 'gh-pages'

const config = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
}

debug(`config:${JSON.stringify(config)}`)

export async function generateIssues() {
  const octokit = new Octokit({
    auth: token,
  })

  const issues = await octokit.rest.issues.listForRepo({
    ...config,
  })

  const { data } = issues

  const dir = `./${output}`
  fs.ensureDir(dir)
  for (const issue of data) {
    const { title, body } = issue
    if (!body) continue
    debug(`creating issue post: ${title}`)
    fs.writeFileSync(`${dir}/${title}.md`, body)
  }

  try {
    await commit()
    debug('🚀 Done!')
  }
  catch (error) {
    if (error instanceof Error)
      debug(`commit error:  ${error.message}`)
  }
}

export async function commit() {
  debug(`commit ${output}`)
  await exec.exec('git', ['config', '--global', 'user.name', 'issue-blog-bot'])
  await exec.exec('git', ['add', output])
  await exec.exec('git', ['commit', '-m', 'chore: update issue blog'])
  await exec.exec('git', ['push', 'origin', branch])
}
