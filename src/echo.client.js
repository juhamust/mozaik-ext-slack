class EchoClient {

  constructor() {

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
        this.onMessage();
      }
    }, 1500);
  }

  // Register a callback
  message(cb) {
    this.cb = cb;
  }

  onMessage() {
    console.log('message!');
    this.cb({
      type: 'message',
      channel: 'C02GVP9DZ',
      user: 'U02558FA2',
      text: 'foobar',
      ts: '1475003567.000006',
      team: 'T0254ARL8'
    });
  }

}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//
export default () => {
  return new EchoClient();
};
