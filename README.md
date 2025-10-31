# TurboRepo + RsBuild Project

Monorepo project using TurboRepo and RrsBuild, containing the apps host, remote1 and remote2.

Using ModuleFederation, `remote1` and `remote2` area sharing `/page1` and `/page2` between apps, making it possible to navigate using `react-router-dom`.

## Installation:

* This projects uses pnpm, if you dont have it installed: `npm i -g pnpm`

* ### After cloning project, run:

`pnpm install`

* ### Create *.env* file in the root of the project:

```
PUBLIC_HOST=http://localhost:3000
PUBLIC_REMOTE_1=http://localhost:3001
PUBLIC_REMOTE_2=http://localhost:3002
```


* ### Running development:

`pnpm dev`

Project should be running on ports: *3000 | 3001 | 3002*


* ### Running lint on apps and packages

`pnpm lint`
