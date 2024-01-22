import { FetchTogglesStatus, IConfig, IContext, IHeaders, Toggle } from './types';
import { urlWithContextAsQuery } from './utils';

export default class UnleashClient {
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

  /**
   * Generates headers for HTTP requests.
   * 
   * Constructs and returns a set of HTTP headers, including authorization and content type.
   * If an ETag is available, it is also included to manage caching.
   *
   * This method is intended for internal use within the class to prepare headers
   * for HTTP requests.
   *
   * @returns  An object representing HTTP headers.
   */
  private getHeaders(): Record<string, string> {
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

  /**
   * Asynchronously fetches toggle data from the feature toggle provider
   * 
   * If the request is successful and the response status is not 304 (Not Modified),
   * it updates the instance's `etag` and `toggles` properties with the new data from the response.
   * 
   * The method returns a `FetchTogglesStatus` indicating whether the toggles were updated
   * or remained unchanged. If the response is not successful (other than a 304 status), 
   * an error is thrown indicating the failure to fetch toggles.
   *
   * @returns A promise that resolves to a `FetchTogglesStatus` enum, either `Updated`
   * if new data was fetched or `Unchanged` if no updates were needed.
   *
   * @throws Throws an error if the request is not successful (other than a 304 status).
   */
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

  /**
   * Retrieves the toggles.
   * 
   * Returns the array of toggles if they have been previously downloaded.
   * If the toggles are not yet downloaded, it throws an error.
   *
   * @returns An array of toggles if available.
   * @throws {Error} If the toggles have not been downloaded.
   */
  public getToggles(): Toggle[] {
    if (!this.toggles) {
      throw new Error('Toggles not downloaded yet.');
    }

    return this.toggles;
  }

  /**
   * Checks if a toggle with a given name is enabled.
   * 
   * This method iterates through the toggles and returns `true` if a toggle with the specified
   * name is found and is enabled (or false if it's not).
   *
   * If the toggles with the given name is not found, it returns `false`.
   *
   * An error is thrown if the toggles have not been loaded.
   *
   * @param name - The name of the toggle to check.
   * @returns `true` if the toggle is found and enabled, otherwise `false`.
   * @throws {Error} If the toggles have not been downloaded.
   */
  public isEnabled(name: string): boolean {
    if (!this.toggles) {
      throw new Error('Toggles not downloaded yet.');
    }

    for (let i = 0; i < this.toggles.length; i++) {
      if (this.toggles[i].name === name) {
        return this.toggles[i].enabled;
      }
    }

    return false;
  }
}
