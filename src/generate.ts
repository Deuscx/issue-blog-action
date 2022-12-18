import path from 'path'
import { Octokit } from '@octokit/rest'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { config } from './config'
dotenv.config()

const {
  TOKEN: token,
  OUTPUT: output = 'blog-output',
} = process.env

export async function getIssues() {
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
}

