const getServerUrl = () => {
  if (typeof window !== 'undefined') {
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? `http://${window.location.hostname}:8000`
      : window.location.origin;
  }
  return 'http://localhost:8000';
};

const server = getServerUrl();

export default server;
