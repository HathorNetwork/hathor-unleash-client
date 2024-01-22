export interface IStaticContext {
  appName: string;
  environment?: string;
}

export interface IMutableContext {
  userId?: string;
  sessionId?: string;
  properties?: {
    [key: string]: string;
  };
}

export interface IConfig {
  appName: string;
  environment?: string;
  url: URL | string;
  clientKey: string;
  context?: IMutableContext;
}

export interface IHeaders {
  Authorization: string;
  Accept: string;
  'Content-Type': string;
  'If-None-Match'?: string;
}

export type IContext = IStaticContext & IMutableContext;
