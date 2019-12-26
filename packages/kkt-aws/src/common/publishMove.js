//@flow

import { v4 as uuid } from 'uuid';
import { SQS } from 'aws-sdk';

const publishMove = async ({ battleId, bot, move }) => {
  const moveId = uuid();
  const moveMessage = { battleId, bot, move, moveId };
  console.log('Publishing Move', moveMessage);
  try {
    const { color: botColor = '?' } = bot || {};
    const { type: moveType = '?' } = move || {};
    const { env: { QUEUE_URL: QueueUrl } = {} } = process;
    const sqs = new SQS();
    const params = {
      MessageAttributes: {
        BattleId: {
          DataType: 'String',
          StringValue: battleId,
        },
        MoveId: {
          DataType: 'String',
          StringValue: moveId,
        },
        BotColor: {
          DataType: 'String',
          StringValue: botColor,
        },
        MoveType: {
          DataType: 'String',
          StringValue: moveType,
        },
      },
      MessageDeduplicationId: moveId,
      MessageGroupId: 'movebot',
      MessageBody: JSON.stringify(moveMessage),
      QueueUrl,
    };
    await sqs.sendMessage(params).promise();
    console.log('Finished publishing message', params);
  } catch (err) {
    console.error('Error publishing move', err);
  }
};

export default publishMove;
