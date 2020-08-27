/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import path from 'path';
import loaderUtils from 'loader-utils';
import slash from 'slash';

const comlinkLoaderSpecificOptions = [
  'multiple', 'multi', // @todo: remove these
  'singleton'
];

export default function loader() { }

loader.pitch = function (request) {
  const options = loaderUtils.getOptions(this) || {};
  const singleton = options.singleton;
  const workerLoaderOptions = {};
  for (let i in options) {
    if (comlinkLoaderSpecificOptions.indexOf(i) === -1) {
      workerLoaderOptions[i] = options[i];
    }
  }

  const workerLoader = `!worker-loader?${JSON.stringify(workerLoaderOptions)}!${slash(path.resolve(__dirname, 'comlink-worker-loader.js'))}`;

  const remainingRequest = JSON.stringify(workerLoader + '!' + request);

  const wrapperBuilder = `
  var Worker = require(${remainingRequest});
  var wrap = require('comlink').wrap;

  function getWrappedWorker() {
    var worker = Worker();
    var wrapper = wrap(worker);

    if (typeof Proxy === 'function') {
      var proxy = new Proxy(wrapper, {
        get: function (target, prop, receiver) {
          if (prop === 'worker') {
            return worker;
          }
          return Reflect.get(...arguments);
        }
      });

      return proxy;
    } else {
      wrapper.worker = worker;
      return wrapper;
    }
  } `;


  // ?singleton mode: export an instance of the worker
  if (singleton === true) {
    return `
  ${wrapperBuilder}
  module.exports = getWrappedWorker();
  ${ options.module === false ? '' : 'module.exports.__esModule = true;'}
  `.replace(/\n\s*/g, '');
  }

  // ?singleton=false mode: always return a new worker from the factory
  if (singleton === false) {
    return `
    ${wrapperBuilder}
    module.exports = getWrappedWorker; `.replace(/\n\s*/g, '');
  }

  return `
  ${ wrapperBuilder}
  var inst;
  module.exports = function f() {
    if (this instanceof f)
      return getWrappedWorker();

    return inst || (inst = getWrappedWorker());
  };
  `.replace(/\n\s*/g, '');
};
