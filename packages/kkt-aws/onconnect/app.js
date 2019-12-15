// @flow
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ status: 'Connecting', event }),
  };
  return response;
};
