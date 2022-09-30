<h1 align="center">AWS Multi Env</h1><br>

## Contributing

When contributing to this repository, please first discuss the change you wish to make via [issue](https://github.com/DiogoAbu/aws-multi-env/issues).

## Setting up a development environment

- Install [Node.js](https://nodejs.org/) and [Yarn](https://classic.yarnpkg.com)
- Clone or download the repo
- `yarn` to install dependencies

## Issues needing help

Are you out of ideas, but still wanna help? Check out the [help wanted](https://github.com/DiogoAbu/aws-multi-env/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) or the [good first issue](https://github.com/DiogoAbu/aws-multi-env/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) labels.

## Code style

We have a pre-commit hook enforcing commits to follow our lint rules. The eslint config points to index.js.

- [ESLint](https://eslint.org/) to enforce code style and best practices on JavaScript and TypeScript files.
- [Prettier](https://prettier.io/) to format JSON files.

To check for lint issues on your code, run this on your terminal:

```sh
yarn lint
```
And to auto-fix some of them:
```sh
yarn lint-fix
```

## Commits

We enforce the commit messages to follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

## Pull request

The title of your PR should be descriptive, including either [NEW], [IMPROVEMENT] or [FIX] at the beginning, e.g. [FIX] App crashing on startup.

You may share working results prior to finishing, please include [WIP] in the title. This way anyone can look at your code: you can ask for help within the PR if you don't know how to solve a problem.

Your PR is automatically inspected by various tools, check their response and try to improve your code accordingly. Requests that fail to build or have wrong coding style won't be merged.
