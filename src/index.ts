import EventEmitter from 'node:events';
import { FetchTogglesStatus, IConfig, IContext, IHeaders, Toggle } from './types';
import { urlWithContextAsQuery } from './utils';

export default class UnleashClient extends EventEmitter {
  private url: URL;
  private context: IContext;
  private etag = '';
  private clientKey: string;
  private toggles: Toggle[] | null;

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
    this.toggles = null;
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

    return headers as unknown as Record<string, string>;
  }

  public async fetchToggles(): Promise<FetchTogglesStatus> {
    const url = urlWithContextAsQuery(this.url, this.context);
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-cache',
      headers: this.getHeaders(),
    });

    if (!response.ok && response.status !== 304) {
      throw new Error('Unable to fetch toggles.');
    }

    if (response.ok && response.status !== 304) {
      const data = await response.json();

      this.etag = response.headers.get('ETag') || '';
      this.toggles = data.toggles as unknown as Toggle[];

      return FetchTogglesStatus.Updated;
    }

    return FetchTogglesStatus.Unchanged;
  }

  public getToggles(): Toggle[] {
    if (!this.toggles) {
      throw new Error('Toggles not downloaded yet.');
    }

    return this.toggles;
  }

  public isEnabled(name: string): boolean {
    if (!this.toggles) {
      throw new Error('Toggles not loaded.');
    }

    for (let i = 0; i < this.toggles.length; i++) {
      if (this.toggles[i].name === name) {
        return this.toggles[i].enabled;
      }
    }

    return false;
  }
}
