# build

Builds the JS bundle.

Builder properties can be configured in workspace.json when defining the builder, or when invoking it.
Read more about how to use builders and the CLI here: https://nx.dev/react/guides/cli.

## Properties

### dev

Default: `true`

Type: `boolean`

Generate a development build.

### entryFile

Type: `string`

The entry file relative to project root.

### maxWorkers

Type: `number`

The number of workers we should parallelize the transformer on.

### outputPath

Type: `string`

The output path of the generated files.

### platform

Type: `string`

Platform to build for (ios, android).

### sourceMap

Type: `boolean`

Whether source maps should be generated or not.
