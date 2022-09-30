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
## 🚩 Table of Contents

- [🚩 Table of Contents](#-table-of-contents)
- [🚀 Introduction](#-introduction)
- [🔧 Installation](#-installation)
- [📖 Usage](#-usage)
- [💬 Contributing](#-contributing)
- [❤️ Acknowledgments](#️-acknowledgments)
<!-- [END] Don't edit this section, instead run Markdown AIO: Update Table of Contents -->

## 🚀 Introduction

When deploy to AWS you might want to have different configurations files per environment, and this package does just that.

It finds files prepended with an environment key and renames to proper naming, and remove others.

Example for deploy on `prod`:
```
Renamed: ./.ebextensions/prod-migration.config => ./.ebextensions/migration.config
Removed: ./.ebextensions/staging-certbot.config
```

And then when build is finished:
```
Renamed: ./.ebextensions/migration.config => ./.ebextensions/prod-migration.config
Restored: ./.ebextensions/staging-certbot.config
```

## 🔧 Installation

There's no need to install [aws-multi-env](https://github.com/DiogoAbu/aws-multi-env), you can use it with [npx](https://www.npmjs.com/package/npx).

## 📖 Usage

Use locally:
```sh
npx aws-multi-env --env "env-name" --buildCmd "yarn build-and-zip" --deployCmd "eb deploy"
```

Use on CI to just build, zip and deploy using an action like [beanstalk-deploy](https://github.com/einaregilsson/beanstalk-deploy).
```yml
- name: Prepare deploy
  run: |
    npx aws-multi-env --env "${{ secrets.AWS_ENVIRONMENT_NAME }}" --buildCmd "yarn build && zip -r deploy.zip folders to zip" --skipDeploy
```

| Argument     | Description                                                                                                                                                                                                                  | Type                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| --env        | Environment name to deploy and match files to, it will match the last portion of the name: `app-server-prod` will match `prod`. If no environment was matched, will get from branch name: `main` = `prod`, beta = `staging`. | [string] [required]                                            |
| --source     | Array of glob folders to find files.                                                                                                                                                                                         | [array] [default: ["./.ebextensions/\*\*","./.platform/\*\*"]] |
| --buildCmd   | Command to run after files were renamed/removed and are ready.                                                                                                                                                               | [string] [default: "yarn build-and-zip"]                       |
| --deployCmd  | Command to run after build, at this point the files were reverted and are no longer ready. The `--env` will be appended to this command.                                                                                     | [string] [default: "eb deploy"]                                |
| --skipDeploy | Setting this to true will skip the deploy command.                                                                                                                                                                           | [boolean] [default: false]                                     |
| --tempDir    | Directory to place files that are not from the current environment, will be removed once script is done.                                                                                                                     | [string] [default: os.tmpdir()]                                |

## 💬 Contributing

Would like to help make this package better? Please take a look at the [contributing guidelines](./CONTRIBUTING.md) for a detailed explanation on how you can contribute.

## ❤️ Acknowledgments

I'd like thank my daily coffee!
