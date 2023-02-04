<h1 align="center">AWS Multi Env</h1><br>

<p align="center">
  Rename and remove files to match deployment environment.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/aws-multi-env">
    <img alt="npm" src="https://img.shields.io/npm/v/aws-multi-env?style=flat-square">
  </a>
  <a href="https://github.com/DiogoAbu/aws-multi-env/actions">
    <img alt="GitHub Workflow Status (with branch)" src="https://img.shields.io/github/actions/workflow/status/DiogoAbu/aws-multi-env/generate-release.yml?branch=main&label=Release%20Workflow&style=flat-square">
  </a>
</p>

<!-- [BEGIN] Don't edit this section, instead run Markdown AIO: Update Table of Contents -->
## 🚩 Table of Contents

- [🚩 Table of Contents](#-table-of-contents)
- [🚀 Introduction](#-introduction)
- [🔧 Installation](#-installation)
- [📖 Usage](#-usage)
  - [Commands](#commands)
  - [Options](#options)
  - [Using config file](#using-config-file)
- [💬 Contributing](#-contributing)
- [❤️ Acknowledgments](#️-acknowledgments)
<!-- [END] Don't edit this section, instead run Markdown AIO: Update Table of Contents -->

## 🚀 Introduction

When deploying to AWS you might want to have different configurations files per environment, and this package does just that.

It finds files that match an environment key and renames to proper naming, remove files from other environments and keep the ones without especific env.

## 🔧 Installation

There's no need to install [aws-multi-env](https://github.com/DiogoAbu/aws-multi-env), you can use it with [npx](https://www.npmjs.com/package/npx).

## 📖 Usage

To run any command the working tree on the source folders must be clean.

```sh
npx aws-multi-env [command] <options>
```

Preparing files for deployment with an application name `app-server-prod`:
```sh
$ npx aws-multi-env prepare --env app-server-prod
» i  Current environment: prod
» i  Renaming files from "prod" to correct name, and removing other files
» i    Removed: ./.ebextensions/certbot.staging.config
» i    Keep: ./.ebextensions/migration.config
» i    Removed: ./.ebextensions/ssl.staging.config
» i    Removed: ./.platform/nginx/conf.d/https_custom.staging.conf
» √  Environment ready, files were renamed and/or removed
```

Then, after you build/deploy you can revert the changes to deploy on another environment:
```sh
$ npx aws-multi-env revert --env app-server-prod
» i  Current environment: prod
» i  Renaming files back and restoring removed files
» i    Running: git clean ./.ebextensions/** ./.platform/**
» i    Running: git checkout ./.ebextensions/** ./.platform/**
» √  Environment restored, files renamed back and/or restored
```

Use on CI:
```yml
- name: Prepare deploy staging
  run: |
    npx aws-multi-env prepare --env "${{ secrets.AWS_ENVIRONMENT_NAME_STAGING }}"
    yarn build && zip -r "$RUNNER_TEMP/deploy-staging.zip" .
    npx aws-multi-env revert --env "${{ secrets.AWS_ENVIRONMENT_NAME_STAGING }}"

- name: Prepare deploy prod
  run: |
    npx aws-multi-env prepare --env "${{ secrets.AWS_ENVIRONMENT_NAME_PROD }}"
    yarn build && zip -r "$RUNNER_TEMP/deploy-prod.zip" .
    npx aws-multi-env revert --env "${{ secrets.AWS_ENVIRONMENT_NAME_PROD }}"
```

### Commands

| Command | Description                                                    |
|---------|----------------------------------------------------------------|
| config  | Output loaded configuration                                    |
| prepare | Rename and remove files on source folders to match environment |
| revert  | Undo changes on source folders                                 |

### Options

| Argument              | Description                                                                                                                                                                              | Type                                                           |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| --env                 | Environment name to deploy and match files to, it will match the last portion of the name: `app-server-prod` will match `prod`. If no environment was matched, will match from branches. | [string]                                                       |
| --envs                | Acceptable environments, optionally mapped to branches. Example: --envs.prod --envs.staging=beta                                                                                         | [string] [required]                                            |
| --source              | Array of glob folders to find files.                                                                                                                                                     | [array] [default: ["./.ebextensions/\*\*","./.platform/\*\*"]] |
| --envMatcher          | Regex to match if file is environment specific.                                                                                                                                          | [string] [default: ".+[.][a-z]+\..+$"]                         |
| --envMatcherSeparator | The environment separator on file names                                                                                                                                                  | [string] [default: "."]                                        |
| --dryRun              | Run without making any actual changes                                                                                                                                                    | [boolean] [default: false]                                     |

### Using config file

We use [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to load the config file, checkout some examples:

`.aws-multi-envrc.json`
```json
{
  "envs": {
    "prod": ["main"],
    "staging": ["beta"]
  },
  "source": ["./.ebextensions/**"]
}
```

`.aws-multi-envrc.yml`
```yml
envs:
  prod:
    - main
  staging:
    - beta
source:
  - ./.ebextensions/**
  - ./.platform/**
```

## 💬 Contributing

Would like to help make this package better? Please take a look at the [contributing guidelines](./CONTRIBUTING.md) for a detailed explanation on how you can contribute.

## ❤️ Acknowledgments

I'd like thank my daily coffee!
