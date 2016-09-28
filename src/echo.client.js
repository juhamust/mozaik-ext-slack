class EchoClient {

  constructor(echoMessage) {
    this.echoMessage = echoMessage || {
      type: 'message',
      channel: 'C02GVP9DZ',
      user: 'U02558FA2',
      text: 'Hello from Slack!',
      ts: '1475003567.000006',
      team: 'T0254ARL8'
    }
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

export default (msg) => {
  return new EchoClient(msg);
};
