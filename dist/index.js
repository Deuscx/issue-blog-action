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
var import_gray_matter = __toESM(require("gray-matter"));

// src/utils.ts
var core = __toESM(require("@actions/core"));
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
var alias = getInput2("alias") || {};
var enableTag = getInput2("enableTag") || "post";
var config3 = !isDev ? {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo
} : config;
(0, import_core.debug)(`config:${JSON.stringify(config3)}`);
async function generateIssues() {
  const octokit = new import_rest.Octokit({
    auth: token
  });
  const issues = await octokit.rest.issues.listForRepo({
    ...config3
  });
  const { data } = issues;
  const dir = `./${output}`;
  import_fs_extra.default.ensureDir(dir);
  import_fs_extra.default.emptyDirSync(dir);
  for (const issue of data) {
    const { title, body, user } = issue;
    const { created_at, updated_at, comments, comments_url, labels, milestone } = issue;
    if (user && user.login !== config3.owner)
      continue;
    if (!body || ![milestone == null ? void 0 : milestone.title, ...labels].includes(enableTag))
      continue;
    const frontMatter = { created_at, updated_at, comments, comments_url, labels };
    const aliasFrontMatter = Object.entries(frontMatter).reduce((acc, cur) => {
      const [key, value] = cur;
      const name = alias[key] || key;
      acc[name] = value;
      return acc;
    }, {});
    (0, import_core.debug)(`creating issue post: ${title}`);
    const content = import_gray_matter.default.stringify(body, aliasFrontMatter);
    import_fs_extra.default.writeFileSync(`${dir}/${title}.md`, content);
  }
  try {
    !isDev && await commit();
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
