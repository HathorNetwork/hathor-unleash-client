import {
  describe,
  beforeAll,
  afterAll,
  expect,
  test,
  jest,
} from '@jest/globals';
import UnleashClient from '../src';
import { FetchTogglesStatus } from '../src/types';

describe('UnleashClient', () => {
  const defaultConfig = {
    url: 'https://example.com',
    clientKey: 'not-a-client-key',
    appName: 'tester',
    context: {
      userId: 'user-id',
    },
  };

  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test('fetchToggles should store toggles successfully', async () => {
    const toggles = [{
      name: 'feature-1',
      enabled: true,
    }];

    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => '123123',
      },
      json: () => ({
        toggles,
      }),
    });

    const client = new UnleashClient(defaultConfig);

    await expect(client.fetchToggles()).resolves.not.toThrow();
    expect(client.getToggles()).toStrictEqual(toggles);
  });

  test('fetchToggles should use ETAG and return last toggles if a 304 is received', async () => {
    const toggles = [{
      name: 'feature-1',
      enabled: true,
    }];

    const client = new UnleashClient(defaultConfig);

    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'ETAG-1',
      },
      json: () => ({
        toggles,
      }),
    });

    await expect(client.fetchToggles()).resolves.toStrictEqual(FetchTogglesStatus.Updated);

    // @ts-ignore
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 304,
      headers: {
        get: () => '123123',
      }
    });

    await expect(client.fetchToggles()).resolves.toStrictEqual(FetchTogglesStatus.Unchanged);

    expect(fetch).toHaveBeenCalledWith(`${defaultConfig.url}/?appName=tester&userId=user-id`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        Authorization: defaultConfig.clientKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'If-None-Match': 'ETAG-1',
      },
    });
  });
});
