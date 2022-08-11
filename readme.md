# Swup Debug plugin

Debug plugin adds some useful functionality to the swup for development purposes.
Mainly, it outputs all the events in a console as they happen, which can be useful for debugging.

Plugin also rewrites swups `log` method, so any output provided by plugins is also visible.

Plugin also tries to detect some common mistakes, and outputs a suggestions into a console.

## Installation

This plugin can be installed with npm

```bash
npm install @swup/debug-plugin
```

and included with import

```shell
import SwupDebugPlugin from '@swup/debug-plugin';
```

or included from the dist folder

```html
<script src="./dist/SwupDebugPlugin.js"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupDebugPlugin()]
});
```

## Options

### globalInstance

If `true`, the plugin will store the swup instance on the global window object, making swup available at `window.swup`. Defaults to `false`.

```javascript
new SwupDebugPlugin({
  globalInstance: true
})
```
