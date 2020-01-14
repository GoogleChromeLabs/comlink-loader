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

export default function loader () { }

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

  // ?singleton mode: export an instance of the worker
  if (singleton === true) {
    return `
      module.exports = require('comlink').wrap(require(${remainingRequest})());
      ${options.module === false ? '' : 'module.exports.__esModule = true;'}
    `.replace(/\n\s*/g, '');
  }

  // ?singleton=false mode: always return a new worker from the factory
  if (singleton === false) {
    return `
      module.exports = function () {
        return require('comlink').wrap(require(${remainingRequest})());
      };
    `.replace(/\n\s*/g, '');
  }

  return `
    var wrap = require('comlink').wrap,
        Worker = require(${remainingRequest}),
        inst;
    module.exports = function f() {
      if (this instanceof f) return wrap(Worker());
      return inst || (inst = wrap(Worker()));
    };
  `.replace(/\n\s*/g, '');
};
