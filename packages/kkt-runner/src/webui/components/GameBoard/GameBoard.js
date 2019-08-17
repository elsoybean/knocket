//@flow

import React from 'react';
import { ProximityHexes, PlayerHex, WIDTH, HEIGHT } from '../Field';

import type { SensorData } from '../../../../../kkt-battle/types/GameState.types';

type Props = {
  sensorData: SensorData,
  size: number,
};

const GameBoard = ({ sensorData, size = 22 }: Props) => {
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
      <ProximityHexes proximity={proximity} size={size} />
      <PlayerHex sensorData={sensorData} size={size} />
    </div>
  );
};

export default GameBoard;
