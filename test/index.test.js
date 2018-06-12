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
import './other';
import MyClass from 'comlink-loader!./worker';

const OriginalWorker = self.Worker;
self.Worker = sinon.spy((url, opts) => new OriginalWorker(url, opts));

describe('worker', () => {
  let inst;

  it('should be instantiable', async () => {
    inst = await new MyClass();
    expect(self.Worker).toHaveBeenCalledOnce();
  });

  it('inst.foo()', async () => {
    const result = inst.foo();
    expect(result instanceof Promise).toBe(true);
    expect(await result).toBe(1);
  });

  it('inst.bar("a", "b")', async () => {
    let out = await inst.bar('a', 'b');
    expect(out).toEqual('a [bar:3] b');
  });

  it('should propagate worker exceptions', async () => {
    try {
      await inst.throwError();
    } catch (e) {
      expect(e).toMatch(/Error/);
    }
  });

  it('should re-use Worker instances after the first instance', async () => {
    sinon.reset(self.Worker);

    const secondInst = await new MyClass();
    expect(secondInst).not.toBe(inst);
    expect(await secondInst.foo()).toBe(1);

    expect(self.Worker).not.toHaveBeenCalled();
  });
});
