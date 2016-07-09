import test from 'ava';
import proxyquire from 'proxyquire';
import slackMock from './slack.mock';
import mozaikMock from './mozaik.mock';

// Mock the slack API
const client = proxyquire('../src/client', slackMock).default;

test.cb('slack channel', t => {
  t.plan(2);

  const send = (payload) => {
    t.truthy(payload.type);
    t.truthy(payload.text);
    t.end();
  };

  return client(mozaikMock).message(send);
});
