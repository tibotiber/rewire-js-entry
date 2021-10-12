# rewire-js-entry

Rewire for [react-app-rewired](https://github.com/timarney/react-app-rewired) to change JS entry points of [create-react-app](https://github.com/facebook/create-react-app).

This is a fork from [rewire-entry](https://github.com/tadatuta/rewire-entry) adding compatibility with react-scripts 3.

## Usage

```
npm install react-app-rewired rewire-js-entry --save-dev
```

Create a `config-overrides.js` file in the root directory with something like this:

```js
const rewireEntry = require('rewire-js-entry');

module.exports = rewireEntry({
  entry: ['desktop.js', 'touch.js']
});
```

or for typescript support:

```js
const rewireTypescript = require('react-app-rewire-typescript');
const rewireEntry = require('rewire-js-entry');

module.exports = rewireEntry({
  entry: ['desktop.tsx', 'touch.tsx']
});
```

## Contributing

This is a tiny library with little activity, no process, just reach out ;)

<details>
<summary>Publish process</summary>
Just a reminder for the maintainer ;)

- bump version
- commit / push / merge PR
- tag version `v__` to create release
- add changelog to release note
- run `npm publish` from dev host
  </details>