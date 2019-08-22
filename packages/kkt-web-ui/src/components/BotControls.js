//@flow

import React from 'react';

type ActionButtonProps = {
  label: string,
  onClick: () => void,
};

const ActionButton = ({ label, onClick }: ActionButtonProps) => (
  <button style={{ padding: '0.5em', margin: '2em' }} onClick={onClick}>
    {label}
  </button>
);

type Props = {
  gameId: string,
  onNewSensorData: (data) => void,
};

const BotControls = ({ gameId, onNewSensorData }: Props) => {
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
    const newData = await res.json();
    onNewSensorData(newData);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div>
        <ActionButton
          label="Attack"
          onClick={() => {
            handleAction('attack');
          }}
        />
      </div>

      <div>
        <ActionButton
          label="Ahead"
          onClick={() => {
            handleAction('ahead');
          }}
        />
      </div>

      <div>
        <ActionButton
          label="Rotate Left"
          onClick={() => {
            handleAction('rotateccw');
          }}
        />
        <ActionButton
          label="Wait"
          onClick={() => {
            handleAction('wait');
          }}
        />
        <ActionButton
          label="Rotate Right"
          onClick={() => {
            handleAction('rotatecw');
          }}
        />
      </div>
      <div>
        <ActionButton
          label="Reverse"
          onClick={() => {
            handleAction('reverse');
          }}
        />
      </div>
      <div>
        <ActionButton
          label="Defend"
          onClick={() => {
            handleAction('defend');
          }}
        />
      </div>
    </div>
  );
};

export default BotControls;
