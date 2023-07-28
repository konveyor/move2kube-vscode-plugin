<h1 align="center">
  Move2Kube Extension for VS Code
</h1>

The [Move2Kube](https://move2kube.konveyor.io/) extension helps developers accelerate the process of re-platforming to Kubernetes by analyzing source files.

## Installation

Install the `move2kube` cli application in your machine first. This is a pre-requisite to run the extension.

Please visit the [Move2Kube Command Line Tool Installation](https://move2kube.konveyor.io/installation/cli) for step-by-step guide.

`NOTE: Please make sure move2kube is added to the path. Without that, the extension will not work and throw error.`

## Features

- Discover and create a plan file based on an input directory. (Work in progress)
- Transform artifacts using move2kube plan.

## Usage

- Right click on your folder where you would like to run `move2kube`.
- Select your desired `move2kube` option.
- The output will be generated in a `move2kubepluginoutput` folder which will be in the same level as the folder that was selected for the option.

![Running `transform` command using m2k plugin](./assets/m2k-transform.gif)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fkonveyor%2Fmove2kube-vscode-plugin.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fkonveyor%2Fmove2kube-vscode-plugin?ref=badge_shield)

## References

> [Installation](https://move2kube.konveyor.io/installation)
<br>
> [Tutorial](https://move2kube.konveyor.io/tutorials) 
<br>
> [Concepts](https://move2kube.konveyor.io/concepts) 
<br>
> [Transformers](https://move2kube.konveyor.io/transformers`)
<br>
> [Presentation](https://move2kube.konveyor.io/presentation)
<br>


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fkonveyor%2Fmove2kube-vscode-plugin.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fkonveyor%2Fmove2kube-vscode-plugin?ref=badge_large)