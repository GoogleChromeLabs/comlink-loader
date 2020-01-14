<p align="center">
  <img src="https://i.imgur.com/cLb2dLG.jpg" width="600" alt="comlink-loader">
</p>
<h1 align="center">🛰 comlink-loader 📡</h1>
<p align="center">Offload modules to Worker threads seamlessly using <a href="https://github.com/GoogleChromeLabs/comlink">Comlink</a>.</p>


### Features

- Offload almost any module into a Worker with little or no usage change
- Supports arbitrary classes, objects & functions (`await new Foo()`)
- Works beautifully with async/await
- Built-in code-splitting: workers are lazy-loaded


## Installation

```sh
npm install -D comlink-loader
```


## Usage

The goal of `comlink-loader` is to make the fact that a module is running inside a Worker nearly transparent to the developer.

### Factory Mode (default)

In the example below, there are two changes we must make in order to import `MyClass` within a Worker via `comlink-loader`.

1. instantiation and method calls must be prefixed with `await`, since everything is inherently asynchronous.
2. the value we import from `comlink-loader!./my-class` is now a function that returns our module exports.
    > Calling this function creates a new instance of the Worker.

**my-class.js**: _(gets moved into a worker)_

```js
// Dependencies get bundled into the worker:
import rnd from 'random-int';

// Export as you would in a normal module:
export function meaningOfLife() {
  return 42;
}

export class MyClass {
  constructor(value = rnd()) {
    this.value = value;
  }
  increment() {
    this.value++;
  }
  // Tip: async functions make the interface identical
  async getValue() {
    return this.value;
  }
}
```

**main.js**: _(our demo, on the main thread)_

```js
import MyWorker from 'comlink-loader!./my-class';

// instantiate a new Worker with our code in it:
const inst = new MyWorker();

// our module exports are exposed on the instance:
await inst.meaningOfLife(); // 42

// instantiate a class in the worker (does not create a new worker).
// notice the `await` here:
const obj = await new inst.MyClass(42);

await obj.increment();

await obj.getValue();  // 43
```

### Singleton Mode

Comlink-loader also includes a `singleton` mode, which can be opted in on a per-module basis using Webpack's inline loader syntax, or globally in Webpack configuration. Singleton mode is designed to be the easiest possible way to use a Web Worker, but in doing so it only allows using a single Worker instance for each module.

The benefit is that your module's exports can be used just like any other import, without the need for a constructor. It also supports TypeScript automatically, since the module being imported looks just like it would were it running on the main thread. The only change that is required in order to move a module into a Worker using singleton mode is to ensure all of your function calls use `await`.

First, configure `comlink-loader` globally to apply to all `*.worker.js` files (or whichever pattern you choose). Here we're going to use TypeScript, just to show that it works out-of-the-box:

**webpack.config.js**:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.(js|ts)$/i,
        use: [{
          loader: 'comlink-loader',
          options: {
            singleton: true
          }
        }]
      }
    ]
  }
}
```

Now, let's write a simple module that we're going to load in a Worker:

**greetings.worker.ts**:

```ts
export async function greet(subject: string): string {
  return `Hello, ${subject}!`;
}
```

We can import our the above module, and since the filename includes `.worker.ts`, it will be transparently loaded in a Web Worker!

**index.ts**:

```ts
import { greet } from './greetings.worker.ts';

async function demo() {
  console.log(await greet('dog'));
}

demo();
```


## License

Apache-2.0
