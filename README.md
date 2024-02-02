# Hathor Unleash Client

UnleashClient is a TypeScript client for managing feature toggles in applications. It allows applications to fetch, retrieve, and check the status of feature toggles, providing a simple way to control feature rollouts and experiments

This is a watered-down version of https://github.com/Unleash/unleash-proxy-client-js, with only the features we need in Hathor clients

## Features

- Fetch feature toggles from a remote server.
- Store and retrieve fetched toggles.
- Check the enablement status of a specific toggle.
- Use ETAG to reduce bandwidth


## Building

```bash
# Install dependencies
yarn

# Build
yarn run build
```
