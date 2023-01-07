"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/generate.ts
var import_rest = require("@octokit/rest");
var dotenv = __toESM(require("dotenv"));
var github = __toESM(require("@actions/github"));
var import_fs_extra = __toESM(require("fs-extra"));
var exec = __toESM(require("@actions/exec"));
var import_core = require("@actions/core");

// src/utils.ts
var core = __toESM(require("@actions/core"));
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
(0, import_core.debug)(`config:${JSON.stringify(config2)}`);
async function generateIssues() {
  const octokit = new import_rest.Octokit({
    auth: token
  });
  const issues = await octokit.rest.issues.listForRepo({
    ...config2
  });
  const { data } = issues;
  const dir = `./${output}`;
  import_fs_extra.default.ensureDir(dir);
  for (const issue of data) {
    const { title, body } = issue;
    if (!body)
      continue;
    (0, import_core.debug)(`creating issue post: ${title}`);
    import_fs_extra.default.writeFileSync(`${dir}/${title}.md`, body);
  }
  try {
    await commit();
    (0, import_core.debug)("\u{1F680} Done!");
  } catch (error) {
    if (error instanceof Error)
      (0, import_core.debug)(`commit error:  ${error.message}`);
  }
}
async function commit() {
  (0, import_core.debug)(`commit ${output}`);
  await exec.exec("git", ["config", "--global", "user.name", "issue-blog-bot"]);
  await exec.exec("git", ["add", output]);
  await exec.exec("git", ["commit", "-m", "chore: update issue blog"]);
  await exec.exec("git", ["push"]);
}

// src/index.ts
generateIssues();
