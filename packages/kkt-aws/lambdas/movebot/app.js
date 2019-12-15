// @flow
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ status: 'Moving Bot', event }),
  };
  return response;
};
