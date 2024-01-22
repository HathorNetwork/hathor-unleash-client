import { IContext } from '../types';

/**
 * Constructs a new URL by appending query parameters based on a given context object.
 * 
 * This function takes a URL object and a context object as input. It iterates over the
 * entries of the context object and appends each as a query parameter to the URL. 
 *
 * If the context contains a 'properties' object, each entry of the properties object 
 * is individually appended as a query parameter with its key nested within the 
 * 'properties' namespace. Other context entries are appended directly with their 
 * respective keys and values. 
 *
 * @param url - The original URL to which the query parameters will be appended.
 * @param context - An object representing the context, 
 *                             which contains key-value pairs to be added as query parameters.
 *
 * @returns A new URL object with appended query parameters based on the provided context.
 *
 * Example:
 *   Given a URL 'http://example.com' and a context object 
 *   { appName: 'wallet-mobile', clientKey: 'key', properties: { x: 'foo', y: 'bar' } },
 *   this function will return a new URL: 
 *   'http://example.com?appName=wallet-mobile&clientKey=&properties[x]=foo&properties[y]=bar'.
 */
export const urlWithContextAsQuery = (url: URL, context: IContext): URL => {
  const notNullOrUndefined = ([, value]: [string, string]) =>
      value !== undefined && value !== null;
  const newUrl = new URL(url.toString());

  Object.entries(context)
  .filter(notNullOrUndefined)
  .forEach(([contextKey, contextValue]) => {
    if (contextKey === 'properties' && contextValue) {
      Object.entries<string>(contextValue)
      .filter(notNullOrUndefined)
      .forEach(([propertyKey, propertyValue]) => {
        newUrl.searchParams.append(
          `properties[${propertyKey}]`,
          propertyValue,
        );
      });
    } else {
      newUrl.searchParams.append(contextKey, contextValue);
    }
  });

  return newUrl;
};
