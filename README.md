# Move2Kube-VSCode-Extension

A VSCode extension for the Move2Kube application.

## Documentation

For a deeper dive into how this works, read the guides below.

- [Extension structure](./docs/extension-structure.md)
- [Extension commands](./docs/extension-commands.md)
- [Extension development cycle](./docs/extension-development-cycle.md)

## Run The Code

```bash
# Navigate into project directory
cd hello-world

# Install dependencies for both the extension and webview UI source code
npm run install:all

# Build webview UI source code
npm run build:webview

# Open sample in VS Code
code .
```

Once the code is open inside VS Code you can run the extension by doing the following:

1. Press `F5` to open a new Extension Development Host window
2. Inside the host window, open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and type `Move2Kube: Hello`.
3. For other implemented functions (suppose `plan`), open the command pallete and type `Move2Kube: Plan`.
4. You can also run some functions on the context menu. Right click on the File Workspace and select the Move2Kube plan which is exposed to context menu.

## Code of Conduct

Refer to Konveyor's Code of Conduct [here](https://github.com/konveyor/community/blob/main/CODE_OF_CONDUCT.md).
