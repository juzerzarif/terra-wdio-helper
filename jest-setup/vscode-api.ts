export {};

const mockVsCodeApi = {
  getState: jest.fn(),
  setState: jest.fn(),
  postMessage: jest.fn(),
};

window.acquireVsCodeApi = () => mockVsCodeApi;

beforeEach(() => {
  mockVsCodeApi.getState.mockReset();
  mockVsCodeApi.setState.mockReset();
  mockVsCodeApi.postMessage.mockReset();
});
