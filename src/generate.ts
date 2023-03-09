import { Octokit } from '@octokit/rest'
import * as dotenv from 'dotenv'
import * as github from '@actions/github'
import fs from 'fs-extra'
import * as exec from '@actions/exec'
import { debug } from '@actions/core'
import matter from 'gray-matter'
import { getInput } from './utils'
import { config as defaultConfig } from './config'
dotenv.config()

const isDev = process.env.NODE_ENV === 'development'
const {
  GH_TOKEN: token,
} = process.env
// get Input
const output = getInput('output') || 'blog-output'
const branch = getInput('branch') || 'gh-pages'
const alias = getInput('alias') || {} as Record<string, string>
// 文章根据 label 或者 milestone 来判断是否生成
const enableTag = getInput('enableTag') || 'post'

const config = !isDev
  ? {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    }
  : defaultConfig

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
  fs.emptyDirSync(dir)
  for (const issue of data) {
    const { title, body, user } = issue
    const { created_at, updated_at, comments, comments_url, labels, milestone } = issue

    if (user && user.login !== config.owner) continue
    if (!body || ![milestone?.title, ...labels].includes(enableTag)) continue

    const frontMatter = { created_at, updated_at, comments, comments_url, labels }
    const aliasFrontMatter = Object.entries(frontMatter).reduce<Record<string, any>>((acc, cur) => {
      const [key, value] = cur
      const name = (alias as any)[key] || key
      acc[name] = value
      return acc
    }, {})

    debug(`creating issue post: ${title}`)
    const content = matter.stringify(body, aliasFrontMatter)
    fs.writeFileSync(`${dir}/${title}.md`, content)
  }

  try {
    !isDev && await commit()
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
  await exec.exec('git', ['push'])
}
