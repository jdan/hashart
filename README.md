## hashart

The code behind [hash.jordanscales.com](https://hash.jordanscales.com/stocks/%40jdan), an experiment in turning SHA-256 hashes into pixels.

![a screenshot of https://hash.jordanscales.com/stocks/%40jdan](https://user-images.githubusercontent.com/287268/114303783-d04a3800-9a9d-11eb-8b2d-7ee7b98c9a2b.png)

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

This service is also contained in a Docker image that I automatically publish to [GitHub packages](https://github.com/jdan/hashart/packages/723220):

```
docker run -it --rm -p "3000:3000" docker.pkg.github.com/jdan/hashart/docker:latest
```
