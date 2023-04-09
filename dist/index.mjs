// src/generate.ts
import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import * as github from "@actions/github";
import fs from "fs-extra";
import * as exec from "@actions/exec";
import { debug } from "@actions/core";
import matter from "gray-matter";

// src/utils.ts
import * as core from "@actions/core";
function getInput2(name) {
  return core.getInput(name);
}

// src/config.ts
var config = {
  owner: "Deuscx",
  repo: "issue-blog-action"
};

// src/generate.ts
dotenv.config();
var isDev = process.env.NODE_ENV === "development";
var {
  GH_TOKEN: token
} = process.env;
var output = getInput2("output") || "blog-output";
var branch = getInput2("branch") || "gh-pages";
var alias = JSON.parse(getInput2("alias") || "{}");
var enableTag = getInput2("enableTag") || "post";
var config3 = !isDev ? {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo
} : config;
debug(`config:${JSON.stringify(config3)}`);
async function generateIssues() {
  const octokit = new Octokit({
    auth: token
  });
  const issues = await octokit.rest.issues.listForRepo({
    ...config3
  });
  const { data } = issues;
  const dir = `./${output}`;
  fs.ensureDir(dir);
  fs.emptyDirSync(dir);
  for (const issue of data) {
    const { title, body, user } = issue;
    const { created_at, updated_at, comments, comments_url, labels, milestone, number } = issue;
    if (user && user.login !== config3.owner)
      continue;
    if (!body || ![milestone == null ? void 0 : milestone.title, ...labels].includes(enableTag))
      continue;
    const frontMatter = { created_at, updated_at, comments, comments_url, labels, number, title };
    const aliasFrontMatter = Object.entries(frontMatter).reduce((acc, cur) => {
      const [key, value] = cur;
      const name = alias[key] || key;
      acc[name] = value;
      return acc;
    }, {});
    debug(`creating issue post: ${title}`);
    const content = matter.stringify(body, aliasFrontMatter);
    fs.writeFileSync(`${dir}/${title}.md`, content);
  }
  try {
    !isDev && await commit();
    debug("\u{1F680} Done!");
  } catch (error) {
    if (error instanceof Error)
      debug(`commit error:  ${error.message}`);
  }
}
async function commit() {
  debug(`commit ${output}`);
  await exec.exec("git", ["config", "--global", "user.name", "issue-blog-bot"]);
  await exec.exec("git", ["add", output]);
  await exec.exec("git", ["commit", "-m", "chore: update issue blog"]);
  await exec.exec("git", ["push"]);
}

// src/index.ts
generateIssues();
