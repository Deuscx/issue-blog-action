// src/generate.ts
import path from "path";
import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import * as github from "@actions/github";
import fs from "fs-extra";
import simpleGit from "simple-git";
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
  const dir = path.resolve(__dirname, `../${output}`);
  fs.ensureDir(dir);
  for (const issue of data) {
    const { title, body } = issue;
    if (!body)
      continue;
    fs.writeFileSync(path.resolve(`${dir}/${title}.md`), body);
  }
  try {
    await commit();
    debug("\u{1F680} Done!");
  } catch (error) {
    if (error instanceof Error)
      debug(`commit error:  ${error.message}`);
  }
}
var baseDir = path.join(process.cwd(), getInput2("cwd") || "");
var git = simpleGit({ baseDir });
function commit() {
  git.add("./*").commit("chore: update issue blog").push(void 0, branch);
}

// src/index.ts
generateIssues();
