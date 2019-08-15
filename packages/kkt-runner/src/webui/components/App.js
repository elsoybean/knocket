//@flow

import React, { useState, useEffect } from 'react';
import HeadsUpDisplay from './HeadsUpDisplay';

const App = () => {
  const [gameId, setGameId] = useState();
  const [sensorData, setSensorData] = useState();
  const [complete, setComplete] = useState();
  const [winner, setWinner] = useState();

  useEffect(() => {
    const loadState = async () => {
      const gameId = localStorage && localStorage.getItem('kkt-game-id');
      if (gameId) {
        const res = await fetch('/api/battle/' + gameId);
        if (res.ok) {
          const {
            sensorData: currentData,
            complete = false,
            winner,
          } = await res.json();
          setGameId(gameId);
          setSensorData(currentData);
          setComplete(complete);
          setWinner(winner);
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
            strategy: { type: 'hunter' },
          },
          {
            color: 'blue',
            strategy: { type: 'explorer' },
          },
        ],
      }),
    });
    const {
      id,
      sensorData: newData,
      complete = false,
      winner,
    } = await res.json();
    setGameId(id);
    setSensorData(newData);
    setComplete(complete);
    setWinner(winner);

    localStorage && localStorage.setItem('kkt-game-id', id);
  };

  const handleAction = async (action) => {
    const move =
      action == 'rotatecw'
        ? { type: 'rotate', options: { clockwise: true } }
        : action == 'rotateccw'
        ? { type: 'rotate', options: { clockwise: false } }
        : { type: action };
    const res = await fetch('/api/battle/' + gameId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(move),
    });
    const { sensorData: newData, complete = false, winner } = await res.json();
    setSensorData(newData);
    setComplete(complete);
    setWinner(winner);
  };

  return (
    <div>
      <HeadsUpDisplay sensorData={sensorData} />
      {gameId && !complete && (
        <div style={{ textAlign: 'center' }}>
          <div>
            <button
              onClick={() => {
                handleAction('attack');
              }}
            >
              Attack
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                handleAction('ahead');
              }}
            >
              Ahead
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                handleAction('rotateccw');
              }}
            >
              Rotate Left
            </button>
            <button
              onClick={() => {
                handleAction('wait');
              }}
            >
              Wait
            </button>
            <button
              onClick={() => {
                handleAction('rotatecw');
              }}
            >
              Rotate Right
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                handleAction('reverse');
              }}
            >
              Reverse
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                handleAction('defend');
              }}
            >
              Defend
            </button>
          </div>
        </div>
      )}
      {gameId && complete && (
        <div>
          <h4>Winner: {winner || '- draw -'}</h4>
          <button onClick={handleStartGame}>Start New Game</button>
        </div>
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
