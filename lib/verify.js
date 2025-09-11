import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

import { execa } from "execa";
import { glob } from "glob";
import { versionRegex } from "./common.js";

import SemanticReleaseError from "@semantic-release/error";

const loadGemspec = async ({ cwd }) => {
  const gemSpecs = await glob("*.gemspec", { cwd });

  if (gemSpecs.length !== 1) {
    throw new SemanticReleaseError(
      "Couldn't find a `.gemspec` file.",
      "ENOGEMSPEC",
      `A single [.gemspec](https://guides.rubygems.org/specification-reference/) file in the root of your project is required to release a Rubygem.

Please follow the "[Make your own gem guide](https://guides.rubygems.org/make-your-own-gem/)" to create a valid \`.gemspec\` file
      `,
    );
  }

  const [gemSpec] = gemSpecs;

  let gemName = null;

  try {
    await execa("ruby", ["--version"]);
  } catch (error) {
    throw new SemanticReleaseError(
      "Ruby is not installed or cannot found in your environment.",
      "ENORUBYNOTFOUND",
      `Ruby runtime is required to publish a gem.`,
    );
  }

  try {
    const { stdout } = await execa(
      "ruby",
      ["-e", `puts Gem::Specification.load('${gemSpec}').name`],
      { cwd },
    );

    gemName = stdout;
  } catch (error) {
    throw new SemanticReleaseError(
      `Error loading \`${gemSpec}\``,
      "EINVALIDGEMSPEC",
      `A valid [.gemspec](https://guides.rubygems.org/specification-reference/) is required to release a Rubygem.

Please follow the "[Make your own gem guide](https://guides.rubygems.org/make-your-own-gem/)" to create a valid \`.gemspec\` file
      `,
    );
  }

  if (gemName === "") {
    throw new SemanticReleaseError(
      `Missing \`name\` attribute in \`${gemSpec}\``,
      "ENOGEMNAME",
      `The [name](https://guides.rubygems.org/specification-reference/#name) attribute is required in your \`.gemspec\` file in order to publish a Rubygem.

Please make sure to add a valid \`name\` for your gem in your \`.gemspec\`.
      `,
    );
  }

  return {
    name: gemName,
    gemSpec,
  };
};

const verifyVersionFile = async ({ cwd, versionGlob }) => {
  const versionFiles = await glob(versionGlob, { cwd });

  if (versionFiles.length !== 1) {
    throw new SemanticReleaseError(
      "Couldn't find a `version.lib` file.",
      "ENOVERSIONFILE",
      `A \`version.rb\` file in the \`lib/*\` dir of your project is required to release a Ruby gem.

Please create a \`version.rb\` file with a defined \`VERSION\` constant in your \`lib\` dir (or subdir).
      `,
    );
  }

  const [versionFile] = versionFiles;

  const fullVersionPath = path.resolve(cwd, versionFile);

  const versionContents = await readFile(fullVersionPath, "utf8");

  if (!versionRegex.test(versionContents)) {
    throw new SemanticReleaseError(
      `Couldn't find a valid version constant defined in \`${versionFile}\`.`,
      "EINVALIDVERSIONFILE",
      `Your \`version.rb\` file must define a \`VERSION\` constant.

Please define your gem's version a string constant named \`VERSION\` inside your \`version.rb\` file.
      `,
    );
  }

  return versionFile;
};

const verifyApiKey = async ({ env, credentialsFile }) => {
  if (!env.GEM_HOST_API_KEY) {
    throw new SemanticReleaseError(
      "No rubygems API key specified.",
      "ENOGEMAPIKEY",
      `A rubygems API key must be created and set in the \`GEM_HOST_API_KEY\` environment variable on you CI environment.

You can retrieve an API key either from your \`~/.gem/credentials\` file or in your profile in [RubyGems.org](http://rubygems.org/).
      `,
    );
  }

  await writeFile(
    credentialsFile,
    `---\n:rubygems_api_key: ${env.GEM_HOST_API_KEY}`,
    "utf8",
  );
};

export default async function verify(
  { versionGlob = "lib/**/version.rb" },
  { env, cwd },
  { credentialsFile },
) {
  const { name, gemSpec } = await loadGemspec({
    cwd,
  });

  const versionFile = await verifyVersionFile({
    cwd,
    versionGlob,
  });

  await verifyApiKey({
    env,
    cwd,
    credentialsFile,
  });

  return {
    gemName: name,
    gemSpec,
    versionFile,
  };
}
