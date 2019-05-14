import test from 'ava';
import fs from 'fs';
import os from 'os';
import path from 'path';
import proxyquire from 'proxyquire';
import slackMock from './slack.mock';
import mozaikMock from './mozaik.mock';
import emoji from 'emojilib';
import mm from 'micromatch';

process.env.SLACK_TOKEN = 'test';

// Import the tested modules and mock the slack API
import { replaceEmojis } from '../src/client';
const client = proxyquire('../src/client', slackMock).default;
const matchChannel = proxyquire('../src/client', slackMock).matchChannel;

test.cb('slack channel', t => {
  process.env.SLACK_PUBLIC_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mozaik-ext-slack'));
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

test('filters', t => {
  t.true(matchChannel('#general', 'general'));
  t.true(matchChannel('#general', '*'));
  t.false(matchChannel('team-x', '!team-*, general'));
  t.true(matchChannel('#general', '!team-*,general'));
  t.false(matchChannel('#foo', '!team-*,general'));
});
