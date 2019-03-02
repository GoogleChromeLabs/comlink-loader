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

export default function loader () { }

loader.pitch = function (request) {
  const options = loaderUtils.getOptions(this) || {};
  const multi = options.multiple || options.multi || options.singleton === false;

  return `
    import {proxy} from 'comlinkjs';
    ${multi ? '' : 'var inst;'}
    export default function f() {
      ${multi ? 'var inst =' : 'inst = inst ||'} proxy(require('!worker-loader?${JSON.stringify(options)}!${path.resolve(__dirname, 'comlink-worker-loader.js')}!${request}')());
      return this instanceof f ? new inst : inst;
    }
  `.replace(/\n\s*/g, '');
};
