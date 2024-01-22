import EventEmitter from 'node:events';
import { IConfig, IContext, IHeaders } from './types';
import { urlWithContextAsQuery } from './utils';

export default class UnleashClient extends EventEmitter {
  private url: URL;
  private context: IContext;
  private etag = '';
  private clientKey: string;

  constructor({
    url,
    clientKey,
    appName,
    context,
  }: IConfig) {
    super();

    if (!url) {
      throw new Error('url is required');
    }
    if (!clientKey) {
      throw new Error('clientKey is required');
    }
    if (!appName) {
      throw new Error('appName is required.');
    }

    this.url = url instanceof URL ? url : new URL(url);
    this.clientKey = clientKey;
    this.context = { appName, ...context };
  }

  private getHeaders() {
    const headers: IHeaders = {
      Authorization: this.clientKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.etag !== '') {
      headers['If-None-Match'] = this.etag;
    }

    console.log('Headers: ', headers);

    return headers as unknown as Record<string, string>;
  }

  public async fetchToggles() {
    const url = urlWithContextAsQuery(this.url, this.context);
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-cache',
      headers: this.getHeaders(),
    });

    if (response.ok && response.status !== 304) {
      this.etag = response.headers.get('ETag') || '';
      const data = await response.json();
      console.log('Data: ', data);
    }  else if (!response.ok && response.status !== 304) {
      console.error(
        'Unleash: Fetching feature toggles did not have an ok response'
      );
    } else {
      console.log('wtf?', response);
    }
  }
}

const UNLEASH_URL = 'https://unleash-proxy.b7e6a7f52ee9fefaf0c53e300cfcb014.hathor.network/proxy';
const UNLEASH_CLIENT_KEY = 'wKNhpEXKa39aTRgIjcNsO4Im618bRGTq';
const appName = `wallet-mobile-ios`;

const options = {
  userId: '1BB154B6-8D4C-41ED-BF7C-9400887AB2DD',
  properties: {
    platform: 'ios',
    stage: 'mainnet',
    appVersion: '0.26.3',
  },
};

const client = new UnleashClient({
  url: UNLEASH_URL,
  clientKey: UNLEASH_CLIENT_KEY,
  appName,
  context: options,
});

const main = async () => {
  setInterval(() => {
    const response = client.fetchToggles();
  }, 5000);
};

main();
