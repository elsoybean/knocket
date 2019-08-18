//@flow

import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import GameBoard from './GameBoard';
import GameReplay from './GameReplay';
import BotControls from './BotControls';

const App = () => {
  const [gameId, setGameId] = useLocalStorage('kkt-game-id');
  const [sensorData, setSensorData] = useState();
  const [complete, setComplete] = useState();
  const [winner, setWinner] = useState();
  const [history, setHistory] = useState();

  const handleNewSensorData = ({
    id,
    sensorData,
    complete,
    winner,
    state: { history } = {},
  }) => {
    if (id && id != gameId) {
      setGameId(id);
    }
    setSensorData(sensorData);
    setComplete(complete);
    setWinner(winner);
    setHistory(history);
  };

  useEffect(() => {
    const loadState = async () => {
      if (gameId) {
        const res = await fetch('/api/battle/' + gameId);
        if (res.ok) {
          const newData = await res.json();
          handleNewSensorData(newData);
        }
      }
    };

    loadState();
  }, []);

  const handleStartGame = async () => {
    const res = await fetch('/api/battle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldSize: 4,
        botConfigs: [
          {
            color: 'red',
            strategy: { type: 'model', options: { modelName: 'v2' } },
          },
          {
            color: 'blue',
            strategy: { type: 'explorer' },
          },
        ],
      }),
    });
    const newData = await res.json();
    handleNewSensorData(newData);
  };

  return (
    <div>
      {gameId && !complete && (
        <>
          <GameBoard sensorData={sensorData} size={50} />
          <BotControls gameId={gameId} onNewSensorData={handleNewSensorData} />
        </>
      )}
      {gameId && complete && (
        <>
          <GameReplay history={history} size={37} />
          <div>
            <h4>Winner: {winner || '- draw -'}</h4>
            <button onClick={handleStartGame}>Start New Game</button>
          </div>
        </>
      )}
      {!gameId && (
        <div>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      )}
      <div></div>
    </div>
  );
};

export default App;
