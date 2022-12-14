<h1 align="center">AWS Multi Env</h1><br>

<p align="center">
  Rename and remove files to match deployment environment.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/aws-multi-env">
    <img alt="npm" src="https://img.shields.io/npm/v/aws-multi-env?style=flat-square">
  </a>
  <a href="https://github.com/DiogoAbu/aws-multi-env/actions">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/DiogoAbu/aws-multi-env/Generate%20Release%20and%20Publish%20to%20NPM?label=Generate%20Release%20and%20Publish%20to%20NPM&style=flat-square">
  </a>
</p>

<!-- [BEGIN] Don't edit this section, instead run Markdown AIO: Update Table of Contents -->
## ๐ฉ Table of Contents

- [๐ฉ Table of Contents](#-table-of-contents)
- [๐ Introduction](#-introduction)
- [๐ง Installation](#-installation)
- [๐ Usage](#-usage)
  - [Commands](#commands)
  - [Options](#options)
- [๐ฌ Contributing](#-contributing)
- [โค๏ธ Acknowledgments](#๏ธ-acknowledgments)
<!-- [END] Don't edit this section, instead run Markdown AIO: Update Table of Contents -->

## ๐ Introduction

When deploying to AWS you might want to have different configurations files per environment, and this package does just that.

It finds files that match an environment key and renames to proper naming, remove files from other environments and keep the ones without especific env.

## ๐ง Installation

There's no need to install [aws-multi-env](https://github.com/DiogoAbu/aws-multi-env), you can use it with [npx](https://www.npmjs.com/package/npx).

## ๐ Usage

To run any command the working tree on the source folders must be clean.

```sh
npx aws-multi-env [command] <options>
```

Preparing files for deployment with an application name `app-server-prod`:
```sh
$ npx aws-multi-env prepare --env app-server-prod
ยป i  Current environment: prod
ยป i  Renaming files from "prod" to correct name, and removing other files
ยป i    Removed: ./.ebextensions/certbot.staging.config
ยป i    Keep: ./.ebextensions/migration.config
ยป i    Removed: ./.ebextensions/ssl.staging.config
ยป i    Removed: ./.platform/nginx/conf.d/https_custom.staging.conf
ยป โ  Environment ready, files were renamed and/or removed
```

Then, after you build/deploy you can revert the changes to deploy on another environment:
```sh
$ npx aws-multi-env revert --env app-server-prod
ยป i  Current environment: prod
ยป i  Renaming files back and restoring removed files
ยป i    Running: git clean ./.ebextensions/** ./.platform/**
ยป i    Running: git checkout ./.ebextensions/** ./.platform/**
ยป โ  Environment restored, files renamed back and/or restored
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

## ๐ฌ Contributing

Would like to help make this package better? Please take a look at the [contributing guidelines](./CONTRIBUTING.md) for a detailed explanation on how you can contribute.

## โค๏ธ Acknowledgments

I'd like thank my daily coffee!
