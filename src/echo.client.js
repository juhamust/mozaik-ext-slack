export default class EchoClient {

  constructor(echoMessage) {
    console.log('EchoClient: constructor');
    this.echoMessage = echoMessage;
  }

  close() {
    console.log("echoClient: close()");
    if (this.id) {
      clearInterval(this.id);
    }
  }

  listen(token) {
    console.log("echoClient: listen(...)");
    if (this.id) {
      this.close();
    }

    console.log('calling setInterval to register a message sending handler');
    setInterval(() => {

      if(getRandom(0, 100) < 40 && this.cb) {
        console.log("echoClient: sending a message");
        this.onMessage(this.echoMessage);
      }
    }, 1500);
  }

  // Register a callback
  message(cb) {
    console.log("echoClient: message()");
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
