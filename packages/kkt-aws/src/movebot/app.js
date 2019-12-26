// @flow
exports.handler = async (event) => {
  console.log('Invoked by Event', event);
  const response = {
    statusCode: 200,
    body: JSON.stringify({ status: 'Moving Bot', event }),
  };
  return response;
};
