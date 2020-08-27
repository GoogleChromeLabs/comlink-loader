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
import MyWorker from 'comlink-loader!./worker';

describe('worker', () => {
  let OriginalWorker;
  let worker, inst;

  beforeAll(() => {
    OriginalWorker = self.Worker;
    self.Worker = sinon.spy((url, opts) => new OriginalWorker(url, opts));
  });

  afterAll(() => {
    // Reset the original Worker constructor for next tests
    self.Worker = OriginalWorker;
  });

  it('should be a factory', async () => {
    worker = new MyWorker();
    expect(self.Worker).toHaveBeenCalledOnce();
    self.Worker.resetHistory();
    expect(self.Worker).not.toHaveBeenCalled();
  });

  it('should be instantiable', async () => {
    inst = await new (worker.MyClass)();
    expect(self.Worker).not.toHaveBeenCalled();
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
    }
    catch (e) {
      expect(e).toMatch(/Error/);
    }
  });

  it('should re-use Worker instances when the factory is invoked without `new`', async () => {
    self.Worker.resetHistory();

    const firstWorker = MyWorker();
    const firstInst = await new (firstWorker.MyClass)();
    expect(await firstInst.foo()).toBe(1);

    expect(self.Worker).toHaveBeenCalledOnce();

    self.Worker.resetHistory();

    const secondWorker = MyWorker();
    const secondInst = await new (secondWorker.MyClass)();
    expect(await secondInst.foo()).toBe(1);
    expect(secondInst).not.toBe(inst);

    expect(self.Worker).not.toHaveBeenCalled();
  });

  it('should have a property to access the underlying worker', async () => {
    self.Worker.resetHistory();

    const worker = MyWorker();
    expect(worker.worker instanceof OriginalWorker).toBe(true);
  });
});

