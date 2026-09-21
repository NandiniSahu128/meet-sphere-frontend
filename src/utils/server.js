const server = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? `http://${window.location.hostname}:8000`
  : window.location.origin;

export default server;



