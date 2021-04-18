## hashart

The code behind [hash.jordanscales.com](https://hash.jordanscales.com), an experiment in turning SHA-256 hashes into pixels.

![a screenshot of https://hash.jordanscales.com/circles/Hello,%20world!](https://user-images.githubusercontent.com/287268/114740072-810f3c00-9d17-11eb-9bad-e1d09f6521e2.png)

### running



```
npm i
npm run dev
```

### a small screenshot service

This repository contains a small service for rendering art directly to PNGs using [canvas](https://www.npmjs.com/package/canvas). You can run it with:

```
node server.js
```

This service is also contained in a Docker image that I automatically publish to [GitHub packages](https://github.com/jdan/hashart/packages/728823):

```
docker run --rm -p "3000:3000" docker.pkg.github.com/jdan/hashart/hashart-srv:latest
```

To be able to use the "mario" piece:

```
docker run --rm -p "3000:3000" -v "/path/to/mariobros.nes:/app/vendor/rom.nes" docker.pkg.github.com/jdan/hashart/hashart-srv:latest
```
