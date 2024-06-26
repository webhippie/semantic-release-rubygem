import path from "node:path";
import { rename, readFile, writeFile } from "node:fs/promises";

import { execa } from "execa";
import { versionRegex } from "./common.js";

const writeVersion = async ({ versionFile, nextVersion, logger, cwd }) => {
  const gemVersion = nextVersion.replace("-", ".");
  const fullVersionPath = path.resolve(cwd, versionFile);
  const versionContents = await readFile(fullVersionPath, "utf8");
  const newContents = versionContents.replace(
    versionRegex,
    `$1${gemVersion}$2`,
  );

  logger.log("Writing version %s to `%s`", nextVersion, versionFile);

  await writeFile(fullVersionPath, newContents, "utf8");

  return { gemVersion };
};

const bundleInstall = async ({
  updateGemfileLock,
  cwd,
  env,
  logger,
  stdout,
  stderr,
}) => {
  const command =
    typeof updateGemfileLock === "string"
      ? updateGemfileLock
      : "bundle install";

  logger.log("Updating lock file with command `%s`", command);

  const installResult = execa.command(command, { cwd, env });

  installResult.stdout.pipe(stdout, { end: false });

  installResult.stderr.pipe(stderr, { end: false });

  await installResult;
};

const buildGem = async ({
  gemSpec,
  gemName,
  version,
  cwd,
  env,
  logger,
  stdout,
  stderr,
}) => {
  const gemFile = `${gemName}-${version}.gem`;

  logger.log("Building gem `%s`", gemFile);

  const buildResult = execa("gem", ["build", gemSpec], { cwd, env });

  buildResult.stdout.pipe(stdout, { end: false });

  buildResult.stderr.pipe(stderr, { end: false });

  await buildResult;

  return gemFile;
};

export default async function prepare(
  { updateGemfileLock = false, gemFileDir = false },
  { nextRelease: { version }, cwd, env, logger, stdout, stderr },
  { versionFile, gemSpec, gemName },
) {
  const { gemVersion } = await writeVersion({
    versionFile,
    nextVersion: version,
    logger,
    cwd,
  });

  if (updateGemfileLock) {
    await bundleInstall({
      updateGemfileLock,
      cwd,
      env,
      logger,
      stdout,
      stderr,
    });
  }

  let gemFile = await buildGem({
    gemSpec,
    gemName,
    version: gemVersion,
    cwd,
    env,
    logger,
    stdout,
    stderr,
  });

  if (gemFileDir) {
    const gemFileSource = path.resolve(cwd, gemFile);

    const gemFileDestination = path.resolve(cwd, gemFileDir.trim(), gemFile);

    if (gemFileSource !== gemFileDestination) {
      await rename(gemFileSource, gemFileDestination);
    }

    gemFile = path.join(gemFileDir.trim(), gemFile);
  }

  return {
    gemFile,
  };
}
