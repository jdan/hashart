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
docker run --rm -p "3000:3000" ghcr.io/jdan/hashart/hashart-srv:latest
```

To be able to use the "mario" piece:

```
docker run --rm -p "3000:3000" -v "/path/to/mariobros.nes:/app/vendor/roms/mariobros.nes" docker.pkg.github.com/jdan/hashart/hashart-srv:latest
```

### rendering hashart on screens

I uploaded [arduino.cc](/arduino.cc) to an [Inkplate 6](https://inkplate.io/) to display random
hashart pieces in my apartment. I framed my inkplate using [Level Frames](https://www.levelframes.com/frames/new?width=5.25&height=4) (5 1/4" x 4" with 1 1/2" matting) and gave it a [2000mAh battery](https://www.adafruit.com/product/2011) which lasts quite a long time.

![A photo of two stuffed animals next to a wooden frame with a digital screen in the middle of it. The screen contains a piece of art consisting of semicircles stacked on top of each other tightly, almost resembling a Slinky, scattered around the canvas](https://user-images.githubusercontent.com/287268/119571180-0a864500-bd7f-11eb-8e04-f039b8b98c04.png)
