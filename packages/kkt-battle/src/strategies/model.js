//@flow

import path from 'path';
import * as tf from '@tensorflow/tfjs';
import { encodeSensorData, ACTIONS } from '../model/encoder';

import type { Move } from '../../types/Move.types';

const _models = {};

const model = ({ modelName }) => {
  if (!_models[modelName]) {
    const modelPath = `http://localhost:3000/models/${modelName}/model.json`;
    _models[modelName] = tf.loadLayersModel(modelPath);
  }
  const modelPromise = _models[modelName];

  return async (sensorData: SensorData, final: boolean): Promise<?Move> => {
    if (final) {
      return;
    }

    const encodedData = encodeSensorData(sensorData);
    const loadedModel = await modelPromise;
    const [predictions] = await loadedModel
      .predict(tf.tensor([encodedData]))
      .array();
    const action =
      ACTIONS[
        predictions.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0)
      ];

    return action == 'rotatecw'
      ? { type: 'rotate', options: { clockwise: true } }
      : action == 'rotateccw'
        ? { type: 'rotate', options: { clockwise: false } }
        : { type: action };
  };
};

export default model;
