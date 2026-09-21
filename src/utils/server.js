const getServerUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const server = getServerUrl();

export default server;
