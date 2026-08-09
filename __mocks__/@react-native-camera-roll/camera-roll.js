// No native module under Jest — BookingSuccessScreen imports this at module load.
module.exports = {
  CameraRoll: {
    saveAsset: jest.fn().mockResolvedValue({ node: { image: { uri: 'mock://saved.png' } } }),
    save: jest.fn().mockResolvedValue('mock://saved.png'),
  },
};
