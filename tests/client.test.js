import test from 'ava';
import proxyquire from 'proxyquire';
import slackMock from './slack.mock';
import mozaikMock from './mozaik.mock';
import emoji from 'emojilib';
import { replaceEmojis } from '../src/client';

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

test('replace emojis', t => {
  t.is(replaceEmojis('testing :smile: :+1:'), `testing ${emoji.lib.smile.char} ${emoji.lib['+1'].char}`);
  t.is(replaceEmojis('missing :foo:'), 'missing :foo:');
});
