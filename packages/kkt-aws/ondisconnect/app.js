// @flow
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ status: 'Disconnecting', event }),
  };
  return response;
};
