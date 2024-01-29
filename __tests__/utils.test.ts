import {
  describe,
  expect,
  test,
} from '@jest/globals';
import { urlWithContextAsQuery } from '../src/utils';

describe('Utils', () => {
  test('should append context as query parameters to the URL', () => {
    const url = new URL('http://example.com');
    const context = {
      appName: 'appName',
      properties: {
        prop1: 'propValue1',
        prop2: 'propValue2'
      }
    };

    const expectedUrl = 'http://example.com/?appName=appName&properties[prop1]=propValue1&properties[prop2]=propValue2';
    const resultUrl = urlWithContextAsQuery(url, context).toString();

    expect(resultUrl).toStrictEqual(encodeURI(expectedUrl));
  });
});
