# dev-server

Starts the dev server for JS bundle.

Builder properties can be configured in workspace.json when defining the builder, or when invoking it.
Read more about how to use builders and the CLI here: https://nx.dev/node/guides/cli.

## Properties

### host

Default: `localhost`

Type: `string`

The host to listen on.

### port

Default: `8081`

Type: `number`

The port to listen on.

### resetCache

Default: `false`

Type: `boolean`

Resets metro cache.
