/* eslint require-atomic-updates: off */
import { temporaryFile } from "tempy";

import gemVerify from "./lib/verify.js";
import gemPrepare from "./lib/prepare.js";
import gemPublish from "./lib/publish.js";

const credentialsFile = temporaryFile({ name: "gem_credentials" });

let versionFile;

let gemName;
let gemSpec;
let gemFile;

export async function verifyConditions(pluginConfig, context) {
  ({ gemName, gemSpec, versionFile } = await gemVerify(pluginConfig, context, {
    credentialsFile,
  }));
}

export async function prepare(pluginConfig, context) {
  ({ gemFile } = await gemPrepare(pluginConfig, context, {
    versionFile,
    gemSpec,
    gemName,
  }));
}

export async function publish(pluginConfig, context) {
  await gemPublish(pluginConfig, context, {
    gemFile,
    gemName,
    credentialsFile,
  });
}
