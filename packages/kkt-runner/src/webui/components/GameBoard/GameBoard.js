//@flow

import React from 'react';
import ProximityHexes from './internal/ProximityHexes';
import PlayerHex from './internal/PlayerHex';
import { WIDTH, HEIGHT } from './internal/constants';

import type { SensorData } from '../../../../../kkt-battle/types/GameState.types';

type Props = {
  sensorData: SensorData,
};

const GameBoard = ({ sensorData }: Props) => {
  const { proximity = [] } = sensorData || {};

  return (
    <div
      style={{
        position: 'relative',
        width: WIDTH,
        height: HEIGHT,
        margin: '0 auto',
      }}
    >
      <ProximityHexes proximity={proximity} />
      <PlayerHex sensorData={sensorData} />
    </div>
  );
};

export default GameBoard;
