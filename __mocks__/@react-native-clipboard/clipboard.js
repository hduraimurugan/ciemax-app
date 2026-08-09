// No native module under Jest — OffersScreen imports this at module load.
module.exports = {
  __esModule: true,
  default: {
    setString: jest.fn(),
    getString: jest.fn().mockResolvedValue(''),
  },
};
