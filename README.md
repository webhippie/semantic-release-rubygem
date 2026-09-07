# @webhippie/semantic-release-rubygem

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin for publishing gems to [Rubygems](https://rubygems.org/).

| Step               | Description                                                                                                                                                                                                |     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `verifyConditions` | Locate and validate a `.gemspec` file, locate and validate a `lib/**/version.rb` file, verify the presence of the `GEM_HOST_API_KEY` environment variable, and create a credentials file with the API key. |     |
| `prepare`          | Update the version in the `lib/**/version.rb` version file and [build](https://guides.rubygems.org/command-reference/#gem-build) the gem.                                                                  |     |
| `publish`          | [Push the gem](https://guides.rubygems.org/command-reference/#gem-push) to the gem server.                                                                                                                 |     |

## Install

```bash
$ npm install @webhippie/semantic-release-rubygem -D
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@webhippie/semantic-release-rubygem",
      {
        "gemPublish": true
      }
    ]
  ]
}
```

## Configuration

### Rubygems authentication

The Rubygems authentication configuration is **required**. The API key must be set using the `GEM_HOST_API_KEY` environment variable. To retrieve the key, you can:

1. Login to [Rubygems.org](https://rubygems.org) and click on ['Edit Profile'](https://rubygems.org/profile/edit). You'll find the key in the 'API Access' section of the page.
2. Open a terminal on your machine and sign in using the [`gem signin`](https://guides.rubygems.org/command-reference/#gem-signin) command. After you enter your credentials, your API key will be stored as a YAML value in the `~/.gem/credentials` file under the `rubygems_api_key` key.

### Gemspec file

This plugin requires exactly one valid `.gemspec` file to be present in the current working directory.

### `lib/**/version.rb` file

This plugin requires the version of the published gem to be defined in a `version.rb` file somewhere in the `lib` folder (e.g. `lib/mygem/version.rb`). The version itself must be defined as a constant named `VERSION` inside the file:

```ruby
module Mygem
  VERSION = '0.0.0'.freeze
end
```

### Options

| Options             | Description                                                                                                                                                                                                                                                                                                                                                                                                                | Default                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `gemHost`           | The server to push the gem to                                                                                                                                                                                                                                                                                                                                                                                              | `'https://rubygems.org'` |
| `updateGemfileLock` | Whether to update the version of the gem to publish in the `Gemfile.lock`. This is useful if you are using the [`@semantic-release/git`](https://github.com/semantic-release/git) plugin to keep the version up to date in your git repo. When set to `true` the plugin will run `bundle install` to update the version. If another command is desired, it can be set by passing a string, e.g. `bundle appraisal install` | `false`                 |
| `gemPublish`        | Whether to publish your gem to the server.                                                                                                                                                                                                                                                                                                                                                                                 | `true`                  |
| `gemFileDir`        | Directory path in which to write the the built `.gem` file. If `false`, the `.gem` file will not be kept on the file system                                                                                                                                                                                                                                                                                                | `false`                 |
| `versionGlob`       | The glob matching for the version file within the repository                                                                                                                                                                                                                                                                                                                                                               | `lib/**/version.rb`     |

## Security

If you find a security issue please contact
[thomas@webhippie.de](mailto:thomas@webhippie.de) first.

## Contributing

Generally we are following [conventional commits][commits] when we apply
changes. That way we are able to generate proper changelogs for every release.
Please use always pull requests to integrate new functionalities or to fix
issues.

For the release process we are following [semantic versioning][semver] which
clearly indicates if a new version just resolves bugs, includes new features or
even includes breaking changes.

After installing the tools via `mise install` as described above set up the
pre-commit hooks so they run automatically on every commit:

```console
prek install --hook-type pre-commit --hook-type commit-msg
```

> `prek` is managed by mise and will be available after `mise install`.

If you have changed something on the source you should simply commit following
the mentioned conventions:

```console
git checkout -b feat/new-feature
git add --all
git commit -m 'feat: added awesome new feature'
git push --set-upstream origin feat/new-feature
```

After pushing your changes into the Git repository you should create a pull
request on GitHub. If the pull request have been merged and everything built
fine it will also create automatically a new release at least once a week.

## Authors

-   [Thomas Boerger](https://github.com/tboerger)

## License

MIT

## Copyright

```console
Copyright (c) 2024 Thomas Boerger <thomas@webhippie.de>
```
