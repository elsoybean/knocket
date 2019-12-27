//@flow

import { SQS } from 'aws-sdk';

const publishBattle = async ({ id, elapsed }) => {
  const { env: { QUEUE_URL: QueueUrl } = {} } = process;
  try {
    const sqs = new SQS();
    const params = {
      MessageAttributes: {
        BattleId: {
          DataType: 'String',
          StringValue: id,
        },
      },
      MessageDeduplicationId: `${id}-${elapsed}`,
      MessageGroupId: 'startbattle',
      MessageBody: id,
      QueueUrl,
    };
    console.debug('Publishing battle to start a cycle', params);
    await sqs.sendMessage(params).promise();
  } catch (err) {
    console.error('Error publishing battle', id);
  }
};

export default publishBattle;
