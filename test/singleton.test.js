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

import sinon from 'sinon';
import 'jasmine-sinon';

const OriginalWorker = self.Worker;
self.Worker = sinon.spy((url, opts) => new OriginalWorker(url, opts));

describe('singleton', () => {
  let exported;

  it('should immediately instantiate the worker', async () => {
    // we're using dynamic import here so the Worker spy can be installed before-hand
    exported = require('comlink-loader?singleton!./worker');

    expect(self.Worker).toHaveBeenCalledOnce();

    self.Worker.resetHistory();
  });

  it('should function and not re-instantiate the Worker', async () => {
    const inst = await new exported.MyClass();
    expect(await inst.foo()).toBe(1);

    expect(await exported.hello()).toBe('world');

    expect(self.Worker).not.toHaveBeenCalled();
  });

  it('should propagate worker exceptions', async () => {
    const inst = await new exported.MyClass();
    try {
      await inst.throwError();
    }
    catch (e) {
      expect(e).toMatch(/Error/);
    }
  });
});
