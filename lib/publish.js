import { unlink } from "node:fs/promises";
import { execa } from "execa";

export default async function publish(
  { gemHost, gemPublish = true, gemFileDir = false },
  { cwd, env, logger, nextRelease: { version }, stdout, stderr },
  { gemFile, gemName, credentialsFile },
) {
  if (gemPublish !== false) {
    logger.log(`Publishing version ${version} to rubygems`);

    const args = ["push", gemFile, "--config-file", credentialsFile];

    if (gemHost) {
      args.push("--host", gemHost);
    }

    const pushResult = execa("gem", args, { cwd, env });

    pushResult.stdout.pipe(stdout, { end: false });

    pushResult.stderr.pipe(stderr, { end: false });

    await pushResult;

    logger.log(`Published version ${version} of ${gemName} to rubygems`);
  } else {
    logger.log(
      `Skip publishing to rubygems because gemPublish is ${gemPublish !== false}`,
    );
  }

  if (gemFileDir === false) {
    await unlink(gemFile);
  }
}
