import path from 'path'
import { Octokit } from '@octokit/rest'
import * as dotenv from 'dotenv'
import * as github from '@actions/github'
import fs from 'fs-extra'
import simpleGit from 'simple-git'
import { debug } from '@actions/core'
import { getInput } from './utils'

dotenv.config()

const {
  TOKEN: token,
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

  const dir = path.resolve(__dirname, `../${output}`)
  fs.ensureDir(dir)
  for (const issue of data) {
    const { title, body } = issue
    if (!body) continue
    fs.writeFileSync(path.resolve(`${dir}/${title}.md`), body)
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

const baseDir = path.join(process.cwd(), getInput('cwd') || '')
const git = simpleGit({ baseDir })

export function commit() {
  git.add('./*').commit('chore: update issue blog').push(undefined, branch)
}
