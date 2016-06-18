import Promise from 'bluebird';

const client = mozaik => {
  const count = 0;

  return {
    channel(send, params) {
      setInterval(() => {
        count += 1;
        send({ count });
      }, 800);
    }
  };
};

export default client;
