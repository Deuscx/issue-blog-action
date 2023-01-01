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
var import_path = __toESM(require("path"));
var import_rest = require("@octokit/rest");
var dotenv = __toESM(require("dotenv"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_simple_git = __toESM(require("simple-git"));
var import_core = require("@actions/core");

// src/config.ts
var config = {
  owner: "Deuscx",
  repo: "WB_SIGN_EXT"
};

// src/utils.ts
var core = __toESM(require("@actions/core"));
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
  const octokit = new import_rest.Octokit({
    auth: token
  });
  const issues = await octokit.rest.issues.listForRepo({
    ...config
  });
  const { data } = issues;
  const dir = import_path.default.resolve(__dirname, `../${output}`);
  import_fs_extra.default.ensureDir(dir);
  for (const issue of data) {
    const { title, body } = issue;
    if (!body)
      continue;
    import_fs_extra.default.writeFileSync(import_path.default.resolve(`${dir}/${title}.md`), body);
  }
  try {
    await commit();
    (0, import_core.debug)("\u{1F680} Done!");
  } catch (error) {
    if (error instanceof Error)
      (0, import_core.debug)(`commit error:  ${error.message}`);
  }
}
var baseDir = import_path.default.join(process.cwd(), getInput2("cwd") || "");
var git = (0, import_simple_git.default)({ baseDir });
function commit() {
  git.add("./*").commit("chore: update issue blog").push();
}

// src/index.ts
generateIssues();
