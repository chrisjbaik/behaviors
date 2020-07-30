(function runner(debug) {
  function sleep(time) {
    return new Promise(resolve => setTimeout(() => resolve(), time));
  }
  class RestoreState {
    constructor(childMatchSelect, child) {
      this.matchValue = xpathString(childMatchSelect, child);
    }
    async restore(rootPath, childMatch) {
      let root = null;
      while (((root = xpathNode(rootPath)), !root)) {
        await sleep(100);
      }
      return xpathNode(childMatch.replace('$1', this.matchValue), root);
    }
  }
  class HistoryState {
    constructor(op) {
      this.loc = window.location.href;
      op();
    }
    get changed() {
      return window.location.href !== this.loc;
    }
    goBack(backButtonQuery) {
      if (!this.changed) {
        return Promise.resolve(true);
      }
      const backButton = xpathNode(backButtonQuery);
      return new Promise((resolve, reject) => {
        window.addEventListener(
          'popstate',
          event => {
            resolve();
          },
          { once: true }
        );
        if (backButton) {
          backButton.click();
        } else {
          window.history.back();
        }
      });
    }
  }
  function xpathNode(path, root) {
    root = root || document;
    return document.evaluate(
      path,
      root,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE
    ).singleNodeValue;
  }
  function xpathString(path, root) {
    root = root || document;
    return document.evaluate(path, root, null, XPathResult.STRING_TYPE)
      .stringValue;
  }
  class TwitterTimeline {
    constructor(maxDepth) {
      this.maxDepth = maxDepth || 0;
      this.rootPath = "//div[starts-with(@aria-label, 'Timeline')]/*[1]/*[1]";
      this.anchorQuery = './/article';
      this.childMatchSelect =
        "string(.//article//a[starts-with(@href, '/') and @aria-label]/@href)";
      this.childMatch = "child::div[.//a[@href='$1']]";
      this.expandQuery =
        ".//div[@role='button' and @aria-haspopup='false']//*[contains(text(), 'more repl')]";
      this.quoteQuery = ".//div[@role='blockquote' and @aria-haspopup='false']";
      this.imageQuery =
        ".//a[@role='link' and @aria-haspopup='false' and starts-with(@href, '/') and contains(@href, '/photo/')]";
      this.imageNextQuery = "//div[@aria-label='Next']";
      this.imageCloseQuery = "//div[@aria-label='Close' and @role='button']";
      this.backButtonQuery = "//div[@aria-label='Back' and @role='button']";
      this.progressQuery = ".//*[@role='progressbar']";
      this.promoted = './/*[text()="Promoted"]';
      this.seenTweets = new Set();
      this.seenMediaTweets = new Set();
      this.state = {
        videos: 0,
        images: 0,
        threadsOrReplies: 0,
        viewedFully: 0,
      };
    }
    getState(msg, incrValue, done = false) {
      if (incrValue && this.state[incrValue] != undefined) {
        this.state[incrValue]++;
      }
      return { state: this.state, msg, done };
    }
    async waitForNext(child) {
      if (!child) {
        return null;
      }
      await sleep(100);
      if (!child.nextElementSibling) {
        return null;
      }
      while (xpathNode(this.progressQuery, child.nextElementSibling)) {
        await sleep(100);
      }
      return child.nextElementSibling;
    }
    async expandMore(child) {
      const expandElem = xpathNode(this.expandQuery, child);
      if (!expandElem) {
        return child;
      }
      const prev = child.previousElementSibling;
      expandElem.click();
      await sleep(100);
      while (xpathNode(this.progressQuery, prev.nextElementSibling)) {
        await sleep(100);
      }
      child = prev.nextElementSibling;
      return child;
    }
    async *infScroll() {
      let root = xpathNode(this.rootPath);
      if (!root) {
        return;
      }
      let child = root.firstElementChild;
      if (!child) {
        return;
      }
      while (child) {
        let anchorElem = xpathNode(this.anchorQuery, child);
        if (!anchorElem && this.expandQuery) {
          child = await this.expandMore(
            child,
            this.expandQuery,
            this.progressQuery
          );
          anchorElem = xpathNode(this.anchorQuery, child);
        }
        if (child && child.innerText) {
          child.scrollIntoView();
        }
        if (child && anchorElem) {
          await sleep(100);
          const restorer = new RestoreState(this.childMatchSelect, child);
          if (restorer.matchValue) {
            yield anchorElem;
            child = await restorer.restore(this.rootPath, this.childMatch);
          }
        }
        child = await this.waitForNext(child, this.progressQuery);
      }
    }
    async *mediaPlaying(tweet) {
      const media = xpathNode('(.//video | .//audio)', tweet);
      if (!media || media.paused) {
        return;
      }
      let msg = 'Waiting for media playback ';
      try {
        const mediaTweetUrl = new URL(
          xpathString(this.childMatchSelect, tweet.parentElement),
          window.location.origin
        ).href;
        if (this.seenMediaTweets.has(mediaTweetUrl)) {
          return;
        }
        msg += 'for ' + mediaTweetUrl;
        this.seenMediaTweets.add(mediaTweetUrl);
      } catch (e) {}
      msg += 'to finish...';
      yield this.getState(msg, 'videos');
      const p = new Promise((resolve, reject) => {
        media.addEventListener('ended', () => resolve());
        media.addEventListener('abort', () => resolve());
        media.addEventListener('error', () => resolve());
        media.addEventListener('pause', () => resolve());
      });
      await Promise.race([p, sleep(60000)]);
    }
    async *iterTimeline(depth = 0) {
      if (this.seenTweets.has(window.location.href)) {
        return;
      }
      yield this.getState('Capturing thread/timeline: ' + window.location.href);
      for await (const tweet of this.infScroll()) {
        if (xpathNode(this.promoted, tweet)) {
          continue;
        }
        await sleep(1000);
        const imagePopup = xpathNode(this.imageQuery, tweet);
        if (imagePopup) {
          const imageState = new HistoryState(() => imagePopup.click());
          yield this.getState(
            'Loading Image: ' + window.location.href,
            'images'
          );
          await sleep(1000);
          let nextImage = null;
          let prevLocation = window.location.href;
          while ((nextImage = xpathNode(this.imageNextQuery))) {
            nextImage.click();
            await sleep(400);
            if (window.location.href === prevLocation) {
              await sleep(1000);
              break;
            }
            prevLocation = window.location.href;
            yield this.getState(
              'Loading Image: ' + window.location.href,
              'images'
            );
            await sleep(1000);
          }
          await imageState.goBack(this.imageCloseQuery);
        }
        const quoteTweet = xpathNode(this.quoteQuery, tweet);
        if (quoteTweet) {
          const quoteState = new HistoryState(() => quoteTweet.click());
          await sleep(100);
          yield this.getState('Capturing Quote: ' + window.location.href);
          if (
            !this.seenTweets.has(window.location.href) &&
            depth < this.maxDepth
          ) {
            yield* this.iterTimeline(depth + 1, this.maxDepth);
            this.seenTweets.add(window.location.href);
          }
          await sleep(2000);
          await quoteState.goBack(this.backButtonQuery);
          await sleep(1000);
        }
        yield* this.mediaPlaying(tweet);
        const tweetState = new HistoryState(() => tweet.click());
        await sleep(200);
        if (tweetState.changed) {
          yield this.getState('Capturing Tweet: ' + window.location.href);
          if (
            !this.seenTweets.has(window.location.href) &&
            depth < this.maxDepth
          ) {
            yield* this.iterTimeline(depth + 1, this.maxDepth);
            this.seenTweets.add(window.location.href);
          }
          await sleep(500);
          await tweetState.goBack(this.backButtonQuery);
        }
        if (depth === 0) {
          this.state.viewedFully++;
        } else {
          this.state.threadsOrReplies++;
        }
        await sleep(1000);
      }
    }
    async *[Symbol.asyncIterator]() {
      yield* this.iterTimeline(0);
      yield this.getState('All Done!', true);
    }
  }
  async function* timelineIterator(cliApi) {
    yield* new TwitterTimeline(1);
  }

  function autobind(clazz) {
    const clazzProps = Object.getOwnPropertyNames(clazz.constructor.prototype);
    let prop;
    let propValue;
    for (var i = 0; i < clazzProps.length; ++i) {
      prop = clazzProps[i];
      propValue = clazz[prop];
      if (prop !== 'constructor' && typeof propValue === 'function') {
        clazz[prop] = propValue.bind(clazz);
      }
    }
  }

  function doneOrWait(rawResults) {
    const result = {
      done: rawResults.done,
      wait: false,
      msg: 'No message',
      state: {},
    };
    if (typeof rawResults.value === 'object') {
      result.wait = !!rawResults.value.wait;
      result.msg = rawResults.value.msg || result.msg;
      result.state = rawResults.value.state || result.state;
    } else {
      result.wait = !!rawResults.value;
    }
    return result;
  }

  function xpathSnapShot(xpathQuery, contextElement) {
    return document.evaluate(
      xpathQuery,
      contextElement || document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
  }
  function xpathSnapShotArray(xpathQuery, contextElement) {
    const snapShot = xpathSnapShot(xpathQuery, contextElement);
    const elements = [];
    const len = snapShot.snapshotLength;
    for (var i = 0; i < len; i++) {
      elements.push(snapShot.snapshotItem(i));
    }
    return elements;
  }
  function maybePolyfillXPG(cliXPG) {
    if (
      typeof cliXPG === 'function' &&
      cliXPG.toString().includes('[Command Line API]')
    ) {
      return cliXPG;
    }
    return xpathSnapShotArray;
  }
  function documentScrollPosition(doc) {
    const documentElem = doc != null ? doc : document;
    const elem = documentElem.body
      ? documentElem.body
      : documentElem.documentElement;
    return {
      scrollTop: elem.scrollTop,
      scrollLeft: elem.scrollLeft,
    };
  }
  function getElementPositionWidthHeight(element, doc) {
    if (element == null) return null;
    const rect = element.getBoundingClientRect();
    const scrollPos = documentScrollPosition(doc);
    return {
      y: rect.top,
      x: rect.left,
      pageY: rect.top + scrollPos.scrollTop,
      pageX: rect.left + scrollPos.scrollLeft,
      w: rect.width,
      h: rect.height,
    };
  }
  function getElementClientPageCenter(element, options) {
    if (element == null) return null;
    const opts = Object.assign({ floor: false }, options);
    const cords = getElementPositionWidthHeight(element, opts.doc);
    const clientX = cords.x + cords.w / 2;
    const clientY = cords.y + cords.h / 2;
    const pageX = cords.pageX + cords.w / 2;
    const pageY = cords.pageY + cords.h / 2;
    return {
      clientX: opts.floor ? Math.floor(clientX) : clientX,
      clientY: opts.floor ? Math.floor(clientY) : clientY,
      pageX: opts.floor ? Math.floor(pageX) : pageX,
      pageY: opts.floor ? Math.floor(pageY) : pageY,
    };
  }

  function __generateDetailPropForMouseEvent(type, clickCount) {
    switch (type) {
      case 'click':
      case 'dblclick':
        return clickCount;
      case 'mousedown':
      case 'mouseup':
        return clickCount + 1;
      default:
        return 0;
    }
  }
  function __getWhichButtonForEvent(type, buttons) {
    switch (type) {
      case 'click':
      case 'dblclick':
      case 'mousedown':
      case 'mouseup':
        return buttons ? 1 : 0;
      default:
        return 0;
    }
  }
  function createMouseEvent(config) {
    let eventPosition;
    if (config.elem && config.position == null) {
      eventPosition = getElementClientPageCenter(config.elem);
      eventPosition.screenX = eventPosition.clientX + eventPosition.pageX;
      eventPosition.screenY = eventPosition.clientY + eventPosition.pageY;
    } else {
      eventPosition = config.position;
    }
    const defaultOpts = {
      button: __getWhichButtonForEvent(config.type),
      buttons: __getWhichButtonForEvent(config.type, true),
      bubbles: true,
      cancelable: true,
      composed: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      view: config.view || window,
      detail: __generateDetailPropForMouseEvent(
        config.type,
        config.clickCount || 0
      ),
    };
    const eventOpts = Object.assign(
      defaultOpts,
      eventPosition,
      config.eventOpts
    );
    return config.view != null
      ? new config.view.MouseEvent(config.type, eventOpts)
      : new MouseEvent(config.type, eventOpts);
  }

  function delay(delayTime) {
    return new Promise(resolve => {
      setTimeout(resolve, delayTime || 3000);
    });
  }

  class BehaviorRunner {
    constructor({ behaviorStepIterator, postStepFN, metadata }) {
      this.stepIterator = behaviorStepIterator;
      this.upCheckInterval = null;
      this.metadata = metadata;
      this.postStepFN = postStepFN;
      this._waitP = null;
      autobind(this);
    }
    get isPaused() {
      return window.$WBBehaviorPaused;
    }
    swapBehaviorIterator(newBehaviorIterator, newPostStepFN) {
      this.stepIterator = newBehaviorIterator;
      if (newPostStepFN) {
        this.postStepFN = newPostStepFN;
      }
    }
    swapPostStepFn(newPostStepFN) {
      this.postStepFN = newPostStepFN;
    }
    waitToBeUnpaused() {
      if (this._waitP) return this._waitP;
      this._waitP = new Promise(resolve => {
        this.upCheckInterval = setInterval(() => {
          if (!window.$WBBehaviorPaused) {
            clearInterval(this.upCheckInterval);
            this._waitP = null;
            resolve();
          }
        }, 2000);
      });
      return this._waitP;
    }
    performStep() {
      const resultP = this.stepIterator.next();
      if (this.postStepFN) {
        return resultP.then(this.postStepFN);
      }
      return resultP.then(doneOrWait);
    }
    step() {
      if (this._waitP) {
        return this._waitP;
      }
      if (window.$WBBehaviorPaused) {
        return this.waitToBeUnpaused().then(this.performStep);
      }
      return this.performStep();
    }
    async *autoRunIter(options) {
      const opts = Object.assign({ noOutlinks: true }, options);
      const haveDelay = typeof opts.delayAmount === 'number';
      window.$WBNOOUTLINKS = opts.noOutlinks;
      let next;
      while (true) {
        next = await this.step();
        yield opts.noOutlinks
          ? next
          : Object.assign({ outlinks: window.$wbOutlinks$ }, next);
        if (next.done) break;
        if (haveDelay) await delay(opts.delayAmount);
      }
    }
    async autoRun(options) {
      const opts = Object.assign({ logging: false }, options);
      for await (const step of this.autoRunIter(opts)) {
        if (opts.logging) {
          console.log(step.msg, step.state);
        }
      }
      if (opts.logging) {
        console.log('done');
      }
    }
    pause() {
      window.$WBBehaviorPaused = true;
    }
    unpause() {
      window.$WBBehaviorPaused = false;
    }
    [Symbol.asyncIterator]() {
      return {
        next: () => this.step(),
      };
    }
  }
  function initRunnableBehavior({
    win,
    behaviorStepIterator,
    postStepFN,
    metadata,
  }) {
    win.$WBBehaviorStepIter$ = behaviorStepIterator;
    const runner = new BehaviorRunner({
      behaviorStepIterator,
      postStepFN,
      metadata,
    });
    win.$WBBehaviorRunner$ = runner;
    win.$WRIteratorHandler$ = runner.step;
    const crect = win.document.documentElement.getBoundingClientRect();
    const x = Math.floor(Math.random() * crect.right - 100);
    const y = Math.floor(Math.random() * crect.bottom - 100);
    win.document.dispatchEvent(
      createMouseEvent({
        type: 'mousemove',
        position: {
          pageX: x,
          pageY: y,
          clientX: x,
          clientY: y,
          screenX: Math.floor(Math.random() * win.screen.width),
          screenY: Math.floor(Math.random() * win.screen.height),
        },
      })
    );
    return runner;
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: timelineIterator({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'twitterTimelineBehavior',
      displayName: 'Twitter Timeline',
      functional: true,
      match: {
        regex: /^(?:https?:[/]{2}(?:www[.])?)?twitter[.]com[/]?.*/,
      },
      description:
        'Capture every tweet, including quotes, embedded videos, images, replies and/or related tweets in thread.',
      updated: '2020-04-27T00:00:00Z',
    },
  });
})(false);
