// src/generate.ts
import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import * as github from "@actions/github";
import fs from "fs-extra";
import * as exec from "@actions/exec";
import { debug } from "@actions/core";

// src/utils.ts
import * as core from "@actions/core";
function getInput2(name) {
  return core.getInput(name);
}

// src/generate.ts
dotenv.config();
var {
  GH_TOKEN: token
} = process.env;
var output = getInput2("output") || "blog-output";
var branch = getInput2("branch") || "gh-pages";
var config2 = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo
};
debug(`config:${JSON.stringify(config2)}`);
async function generateIssues() {
  const octokit = new Octokit({
    auth: token
  });
  const issues = await octokit.rest.issues.listForRepo({
    ...config2
  });
  const { data } = issues;
  const dir = `./${output}`;
  fs.ensureDir(dir);
  for (const issue of data) {
    const { title, body } = issue;
    if (!body)
      continue;
    debug(`creating issue post: ${title}`);
    fs.writeFileSync(`${dir}/${title}.md`, body);
  }
  try {
    await commit();
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
