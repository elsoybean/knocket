//@flow

import { SQS } from 'aws-sdk';

const publishBattle = async (id) => {
  const { env: { QUEUE_URL: QueueUrl } = {} } = process;
  const sqs = new SQS();
  const params = {
    MessageAttributes: {
      BattleId: {
        DataType: 'String',
        StringValue: id,
      },
    },
    MessageDeduplicationId: id,
    MessageGroupId: 'startbattle',
    MessageBody: id,
    QueueUrl,
  };

  await sqs.sendMessage(params).promise();
};

export default publishBattle;
