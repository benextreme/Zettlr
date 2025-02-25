<h1 align="center">
  <a href="https://github.com/Zettlr/Zettlr">
    <img src="https://raw.githubusercontent.com/Zettlr/Zettlr/master/resources/icons/png/256x256.png" alt="Zettlr"/>
  </a>
  <br/>
  Zettlr [<em>ˈset·lər</em>]
</h1>

<p align="center"><strong>A Markdown Editor for the 21<sup>st</sup> century</strong>.</p>

<p align="center">
  <a href="https://doi.org/10.5281/zenodo.2580173">
    <img src="https://zenodo.org/badge/DOI/10.5281/zenodo.2580173.svg" alt="DOI">
  </a>
  <a href="https://www.gnu.org/licenses/gpl-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GNU GPL v3">
  </a>
  <a href="https://www.zettlr.com/download">
    <img alt="GitHub tag (latest by date)" src="https://img.shields.io/github/tag-date/Zettlr/Zettlr.svg?label=latest">
  </a>
  <img alt="GitHub All Releases" src="https://img.shields.io/github/downloads/Zettlr/Zettlr/total.svg">
  <img alt="Test" src="https://github.com/Zettlr/Zettlr/workflows/Test/badge.svg?branch=master">
  <img alt="Build" src="https://github.com/Zettlr/Zettlr/workflows/Build/badge.svg">
</p>

<p align="center">
  <a href="https://www.zettlr.com/" target="_blank">Homepage</a> |
  <a href="https://www.zettlr.com/download">Download</a> |
  <a href="https://docs.zettlr.com/" target="_blank">Documentation</a> |
  <a href="https://forum.zettlr.com/" target="_blank">Discussion Forum</a> |
  <a href="#contributing">Contributing</a> |
  <a href="https://www.patreon.com/zettlr" target="_blank">Support Us</a>
</p>

![screenshot](/resources/screenshots/zettlr_view.png)

With Zettlr, writing professional texts is easy and motivating: Whether you are a college student, a researcher, a journalist, or an author — Zettlr has the right tools for you. [Watch the video](https://www.youtube.com/watch?v=BJ27r6YGpAs) or continue reading to see what they are!

[Visit our Website](https://zettlr.com/).

## Features

- Available in over a dozen languages
- Tight and ever-growing **integration with your favourite reference manager** (such as Zotero or JabRef)
- **Cite with Zettlr** using `citeproc` and your existing literature database
- Five **themes and dark mode support**
- File-agnostic writing: Enjoy **full control over your own files**
- Keep all your notes and texts **in one place** — searchable and accessible
- **Code highlighting** for many languages
- Simple and beautiful **exports** with [Pandoc](https://pandoc.org/), [LaTeX](https://www.latex-project.org/), and [Textbundle](http://textbundle.org/)
- Support for state of the art knowledge management techniques (**Zettelkasten**)
- A revolutionary **search algorithm** with integrated heatmap

… and the best is: **Zettlr is [Open Source (FOSS)](https://en.wikipedia.org/wiki/Free_and_open-source_software)!**

## Installation

To install Zettlr, just [download the latest release](https://www.zettlr.com/download/) for your operating system! Currently supported are macOS, Windows, and most Linux distributions (via Debian- and Fedora-packages as well as AppImages).

All other [platforms that Electron supports](https://www.electronjs.org/docs/tutorial/support#supported-platforms) are supported as well, but you will need to build the app yourself for this to work.

**Please also consider [becoming a patron](https://www.patreon.com/zettlr) or making a [one-time donation](https://paypal.me/hendrikerz)!**

## Getting Started

After you have installed Zettlr, [head over to our documentation](https://docs.zettlr.com/) to get to know Zettlr. Refer to the [Quick Start Guide](https://docs.zettlr.com/en/5-minutes/), if you prefer to use software heads-on.

![The central window of Zettlr using the Night Theme](/resources/screenshots/zettlr_view_dark.png)

## Contributing

Zettlr is an [Electron](https://www.electronjs.org/)-based app, so to start developing, you'll need to have:

1. A [NodeJS](https://nodejs.org/)-stack installed on your computer. Make sure it's at least Node 14 (`lts/fermium`). To test what version you have, run `node -v`.
2. [Yarn](https://yarnpkg.com/en/) installed. Yarn is the required package manager for the project, as we do not commit `package-lock.json`-files and many commands require yarn. You can install this globally using `npm install -g yarn` or Homebrew, if you are on macOS.

Then, simply clone the repository and install the dependencies on your local computer:

```bash
$ git clone https://github.com/Zettlr/Zettlr.git
$ cd Zettlr
$ yarn install --frozen-lockfile
```

The `--frozen-lockfile` flag ensures that yarn will stick to the versions as listed in the `yarn.lock` and not attempt to update them.

During development, hot module reloading is active so that you can edit the renderer's code easily and hit `F5` after the changes have been compiled by `electron-forge`. You can keep the developer tools open to see when HMR has finished loading your changes.

### What Should I Know To Contribute Code?

In order to provide code, you should have basic familiarity with the following topics and/or manuals (ordered by importance descending):

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (especially asynchronous code) and [TypeScript](https://www.typescriptlang.org/docs/)
* [Node.js](https://nodejs.org/api/)
* [ESLint](https://eslint.org/)
* [Electron](https://www.electronjs.org/docs)
* [CodeMirror](https://codemirror.net/doc/manual.html) (5.x)
* [Vue.js](https://vuejs.org/v2/guide/) (2.x) and [Vuex](https://vuex.vuejs.org/)
* [Electron forge](https://www.electronforge.io/)
* [Electron builder](https://www.electron.build/)
* [Webpack 5.x](https://webpack.js.org/concepts/)
* [LESS](https://lesscss.org/#)

> Note: See the "Directory Structure" section below to get an idea of how Zettlr specifically works.

### Development Commands

This section lists all available commands that you can use during application development. These are defined within the `package.json` and can be run from the command line by prefixing them with `yarn`. Run them from within the base directory of the repository.

#### `start`

Starts `electron-forge`, which will build the application and launch it in development mode. This will use the normal settings, so if you use Zettlr on the same computer in production, it will use the same configuration files as the regular application. This means: be careful when breaking things. In that case, it's better to use `test-gui`.

#### `package`

Packages the application, but not bundle it into an installer. Without any suffix, this command will package the application for your current platform. To create specific packages (may require running on the corresponding platform), the following suffixes are available:

- `package:mac`
- `package:win`
- `package:win-arm`
- `package:linux-x32`
- `package:linux-x64`

The resulting application packages are stored in `./out`.

#### `release:{platform}`

Packages the application and then bundles it into an installer for the corresponding platform. To create such a bundle (may require running on the corresponding platform), one of the following values for `{platform}` is required:

- `release:mac`
- `release:win`
- `release:win-arm`
- `release:linux-x32`
- `release:linux-x64`
- `release:linux` (shorthand for calling `yarn release:linux-x32 && yarn release:linux-x64`)

The resulting setup bundles are stored in `./release`.

> Please note that, while you can `package` directly for your platform without any suffix, for creating a release specifying the platform is required as electron-builder would otherwise include the development-dependencies in the `app.asar`, resulting in a bloated application.

#### `lang:refresh`

This downloads the four default translations of the application from [Zettlr Translate](https://translate.zettlr.com/), with which it is shipped by default. It places the files in the `static/lang`-directory. Currently, the default languages are: German (Germany), English (USA), English (UK), and French (France).

> Please note, that this command is intended for an automated workflow that runs from time to time on the repository to perform this action. This means: Do **not** commit updated files to the repository. Instead, the updated files will be downloaded whenever you `git fetch`.

#### `csl:refresh`

This downloads the [Citation Style Language](https://citationstyles.org/) (CSL) files with which the application is shipped, and places them in the `static/csl-locales`- and `static/csl-styles`-directories respectively.

> Please note, that this command is intended for an automated workflow that runs from time to time on the repository to perform this action. This means: Do **not** commit updated files to the repository. Instead, the updated files will be downloaded whenever you `git fetch`.

#### `lint`

This simply runs [ESLint](https://eslint.org/). Apps such as [Atom](https://atom.io/) or [Visual Studio Code](https://code.visualstudio.com/) will automatically run ESLint in the background, but if you want to be extra-safe, make sure to run this command prior to submitting a Pull Request.

> This command will run automatically on each Pull Request to check your code for inconsistencies.

#### `reveal:build`

This re-compiles the source-files needed by the exporter for building [reveal.js](https://revealjs.com/)-presentations. Due to the nature of how [Pandoc](https://pandoc.org/) creates such presentations, Zettlr needs to modify the output by Pandoc, which is why these files need to be pre-compiled.

> Please note, that this command is intended for an automated workflow that runs from time to time on the repository to perform this action. This means: Do **not** commit updated files to the repository. Instead, the updated files will be downloaded whenever you `git fetch`.

#### `test`

This runs the unit tests in the directory `./test`. Make sure to run this command prior to submitting a Pull Request, as this will be run every time you commit to the PR, and this way you can make sure that your changes don't break any tests, making the whole PR-process easier.

#### `test-gui`

Use this command to carefree test any changes you make to the application. This command will start the application as if you ran `yarn start`, but will provide a custom configuration and a custom directory.

**The first time you start this command**, pass the `--clean`-flag to copy a bunch of test-files to your `./resources`-directory, create a `test-config.yml` in your project root, and start the application with this clean configuration. Then, you can adapt the `test-config.yml` to your liking (so that certain settings which you would otherwise _always_ set will be pre-set without you having to open the preferences).

Whenever you want to reset the test directory to its initial state (or you removed the directory, or cloned the whole project anew), pass the flag `--clean` to the command in order to create or reset the directory. **This is also necessary if you changed something in `test-config.yml`**.

You can pass additional command-line switches such as `--clear-cache` to this command as well. They will be passed to the child process.

> Attention: Before first running the command, you **must** run it with the `--clean`-flag to create the directory in the first place!

Additionally, have a look at our [full development documentation](https://docs.zettlr.com/en/get-involved).

### Directory Structure

Zettlr is a mature app that has amassed hundreds of directories over the course of its development. Since it is hard to contribute to an application without any guidance, we have compiled a short description of the directories with how they interrelate.

```
.
├── resources                      # Contains resource files
│   ├── NSIS                       # Images for the Windows installer
│   ├── icons                      # Icons used to build the application
│   ├── screenshots                # The screenshots used in this README file
├── scripts                        # Scripts that are run by the CI and some YARN commands
│   ├── assets                     # Asset files used by some scripts
│   └── test-gui                   # Test files used by `yarn test-gui`
├── source                         # Contains the actual source code for the app
│   ├── app                        # Contains service providers and the boot/shutdown routines
│   ├── common                     # Common files used by several or all renderer processes
│   │   ├── fonts                  # Contains the font files (note: location will likely change)
│   │   ├── img                    # Currently unused image files
│   │   ├── less                   # Contains the themes (note: location will likely change)
│   │   ├── modules                # Contains renderer modules
│   │   │   ├── markdown-editor    # The central CodeMirror markdown editor
│   │   │   ├── preload            # Electron preload files
│   │   │   └── window-register    # Run by every renderer during setup
│   │   ├── util                   # A collection of utility functions
│   │   └── vue                    # Contains Vue components used by the graphical interface
│   ├── main                       # Contains code for the main process
│   │   ├── assets                 # Static files (note: location will likely change)
│   │   ├── commands               # Commands that perform user-actions, run from within zettlr.ts
│   │   └── modules                # Main process modules
│   │       ├── document-manager   # The document manager handles all open files
│   │       ├── export             # The exporter converts Markdown files into other formats
│   │       ├── fsal               # The File System Abstraction Layer provides the file tree
│   │       ├── import             # The importer converts other formats into Markdown files
│   │       └── window-manager     # The window manager manages all application windows
│   ├── win-about                  # Code for the About window
│   ├── win-custom-css             # Code for the Custom CSS window
│   ├── win-defaults               # Code for the defaults file editor
│   ├── win-error                  # The error modal window
│   ├── win-log-viewer             # Displays the running logs from the app
│   ├── win-main                   # The main window
│   ├── win-paste-image            # The modal displayed when pasting an image
│   ├── win-preferences            # The preferences window
│   ├── win-print                  # Code for the print and preview window
│   ├── win-quicklook              # Code for the Quicklook windows
│   ├── win-stats                  # Code for the general statistics window
│   ├── win-tag-manager            # Code for the tag manager
│   └── win-update                 # The dedicated update window
├── static                         # Contains static files, cf. the README-file in there
└── test                           # Unit tests
```

### On the Distinction between Modules and Service Providers

You'll notice that Zettlr contains both "modules" and "service providers". The difference between the two is simple: Service providers run in the main process and are completely autonomous while providing functionality to the app as a whole. Modules, on the other hand, provide functionality that must be triggered by user actions (e.g. the exporter and the importer).

### The Application Lifecycle

Whenever you run Zettlr, the following steps will be executed:

0. Execute `source/main.ts`
1. Environment check (`source/app/lifecycle.ts::bootApplication`)
2. Boot service providers (`source/app/lifecycle.ts::bootApplication`)
3. Boot main application (`source/main/zettlr.ts`)
4. Load the file tree and the documents
5. Show the main window

And when you shut down the app, the following steps will run:

1. Close all windows except the main window
2. Attempt to close the main window
3. Shutdown the main application (`source/main/zettlr.ts::shutdown`)
4. Shutdown the service providers (`source/app/lifecycle.ts::shutdownApplication`)
5. Exit the application

During development of the app (`yarn start` and `yarn test-gui`), the following steps will run:

1. Electron forge will compile the code for the main process and each renderer process separately (since these are separate processes), using TypeScript and webpack to compile and transpile.
2. Electron forge will put that code into the directory `.webpack`, replacing the constants you can find in the "create"-methods of the window manager with the appropriate entry points.
3. Electron forge will start a few development servers to provide hot module reloading (HMR) and then actually start the application.

Whenever the app is built, the following steps will run:

1. Electron forge will perform steps 1 and 2 above, but instead of running the app, it will package the resulting code into a functional app package.
2. Electron builder will then take these pre-built packages and wrap them in a platform-specific installer (DMG-files, Windows installer, or Linux packages).

Electron forge will put the packages applications into the directory `./out` while Electron builder will put the installers into the directory `./release`.

## Command-Line Switches

The Zettlr binary features a few command line switches that you can make use of for different purposes.

#### `--clear-cache`

This will direct the File System Abstraction Layer to fully clear its cache on boot. This can be used to mitigate issues regarding changes in the code base. To ensure compatibility with any changes to the information stored in the cache, the cache is also automatically cleared when the version field in your `config.json` does not match the one in the `package.json`, which means that, as long as you do not explicitly set the `version`-field in your `test-config.yml`, the cache will always be cleared on each run when you type `yarn test-gui`.

#### `--config=path`

Use this switch to temporarily override the default configuration file stored in your AppData-equivalent folder. This path should be absolute. In case you need to provide a relative path, the base for resolving the path will be: either the binary's directory name (when the app is packaged), or the repository root (when the app is not packaged). If the path contains spaces, don't forget to escape it in quotes.

## License

This software is licensed via the [GNU GPL v3-License](https://www.gnu.org/licenses/gpl-3.0.en.html).

The brand (including name, icons and everything Zettlr can be identified with) is excluded and all rights reserved. If you want to fork Zettlr to develop another app, feel free but please change name and icons. [Read about the logo usage](https://www.zettlr.com/press#usage-rights).
