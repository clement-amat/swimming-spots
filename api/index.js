module.exports = async (req, res) => {
  const { reqHandler } = await import('../dist/swimming-spots/server/server.mjs');
  return reqHandler(req, res);
};
