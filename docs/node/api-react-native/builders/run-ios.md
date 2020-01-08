# run-ios

Runs iOS application.

Builder properties can be configured in workspace.json when defining the builder, or when invoking it.
Read more about how to use builders and the CLI here: https://nx.dev/node/guides/cli.

## Properties

### configuration

Default: `Debug`

Type: `string`

Explicitly set the Xcode configuration to use

### device

Type: `string`

Explicitly set device to use by name. The value is not required if you have a single device connected.

### scheme

Type: `string`

Explicitly set the Xcode scheme to use

### simulator

Default: `iPhone X`

Type: `string`

Explicitly set simulator to use. Optionally include iOS version between parenthesis at the end to match an exact version: "iPhone X (12.1)"
