class EchoClient {

  constructor(echoMessage) {
    this.echoMessage = echoMessage;
  }

  close() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  listen(token) {
    if (this.id) {
      this.close();
    }
    setInterval(() => {
      if(getRandom(0, 100) < 40 && this.cb) {
        this.onMessage(this.echoMessage);
      }
    }, 1500);
  }

  // Register a callback
  message(cb) {
    this.cb = cb;
  }

  onMessage(msg) {
    console.log('Echo a message');
    this.cb(msg);
  }

}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

exports.default =  (msg) => {
  return new EchoClient(msg);
};
