/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {GatherV2, GatherV2Attrs, GatherV2Inputs, KernelConfig, scalar, Tensor} from '@tensorflow/tfjs';
import {collectGatherOpShapeInfo} from '@tensorflow/tfjs-core/dist/ops/segment_util';

import {createTensorsTypeOpAttr, NodeJSKernelBackend} from '../nodejs_kernel_backend';

export const gatherV2Config: KernelConfig = {
  kernelName: GatherV2,
  backendName: 'tensorflow',
  kernelFunc: (args) => {
    const {x, indices} = args.inputs as GatherV2Inputs;
    const backend = args.backend as NodeJSKernelBackend;
    const {axis, batchDims} = args.attrs as {} as GatherV2Attrs;

    // validate the inputs
    collectGatherOpShapeInfo(x as Tensor, indices as Tensor, axis, batchDims);

    const axisTensor = scalar(axis, 'int32');
    const opAttrs = [
      {name: 'batch_dims', type: backend.binding.TF_ATTR_INT, value: batchDims},
      createTensorsTypeOpAttr('Tparams', x.dtype),
      createTensorsTypeOpAttr('Tindices', indices.dtype),
      createTensorsTypeOpAttr('Taxis', 'int32')
    ];

    const res = backend.executeSingleOutput(
        GatherV2, opAttrs, [x, indices, axisTensor]);
    axisTensor.dispose();
    return res;
  }
};
