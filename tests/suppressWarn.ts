// when `dispatch` was called asynchronously, it will raise a `console.error`.
// https://stackoverflow.com/questions/55047535/testing-react-components-that-fetches-data-using-hooks
const consoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (!args[0].includes(
            'Warning: An update to %s inside a test was not wrapped in act')) {
      consoleError(...args);
    }
  });
});