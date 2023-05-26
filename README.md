# Quackage

Package.  Test.  Duck.  Name a more iconic trio.

Who doesn't love managing configuration and tooling?  I can tell you who doesn't love it.  I don't love it.

This standardizes:

1. Building an app for a browser
2. Transpiling an app for ... older browsers
3. Running unit tests

## Usage

First you need to install the thing.  The easy way is npm or whatever you use to get your packages, which installs the package and puts a couple commands in your node_modules/.bin folder.  You run it either with `quack` or `q` for short.

```shell
npm install --save-dev quackage
```

Second, quack like a duck.  

### For instance, you can check your build configurations:

```shell
npx quack check-build
```


### You can build the app

```shell
npx quack build
```

### You can test

```shell
npx quack test
```

## If you hate this, you can always inject commands into your `package.json` file:

```shell
npx quack enhance-my-package
```