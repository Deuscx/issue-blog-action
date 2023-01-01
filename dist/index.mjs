// src/generate.ts
import path from "path";
import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import fs from "fs-extra";
import simpleGit from "simple-git";
import { debug } from "@actions/core";

// src/config.ts
var config = {
  owner: "Deuscx",
  repo: "WB_SIGN_EXT"
};

// src/utils.ts
import * as core from "@actions/core";
function getInput2(name) {
  return core.getInput(name);
}

// src/generate.ts
dotenv.config();
var {
  TOKEN: token,
  OUTPUT: output = "blog-output"
} = process.env;
async function generateIssues() {
  const octokit = new Octokit({
    auth: token
  });
  const issues = await octokit.rest.issues.listForRepo({
    ...config
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
  git.add("./*").commit("chore: update issue blog").push();
}

// src/index.ts
generateIssues();
