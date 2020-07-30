(function runner(debug) {
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
  function promiseResolveReject() {
    const promResolveReject = { promise: null, resolve: null, reject: null };
    promResolveReject.promise = new Promise((resolve, reject) => {
      promResolveReject.resolve = resolve;
      promResolveReject.reject = reject;
    });
    return promResolveReject;
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
  function qs(selector, context) {
    if (context != null) return context.querySelector(selector);
    return document.querySelector(selector);
  }
  function qsa(selector, context) {
    if (context != null) return context.querySelectorAll(selector);
    return document.querySelectorAll(selector);
  }
  function selectorExists(selector, cntx) {
    return qs(selector, cntx) != null;
  }
  function firstChildElementOf(elem) {
    if (elem != null) return elem.firstElementChild;
    return null;
  }
  function firstChildElementOfSelector(selector, cntx) {
    return firstChildElementOf(qs(selector, cntx));
  }
  function isElemVisible(elem) {
    if (elem == null) return false;
    const computedStyle = window.getComputedStyle(elem);
    if (computedStyle.display === 'none') return false;
    return computedStyle.visibility === 'visible';
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
  function waitForPredicate(predicate, options) {
    const opts = Object.assign({ pollRate: 1000 }, options);
    const results = { maxExceeded: false, predicate: false };
    let maxTo;
    return new Promise(resolve => {
      if (predicate()) {
        results.predicate = true;
        return resolve(results);
      }
      let int = setInterval(() => {
        if (predicate()) {
          results.predicate = true;
          clearInterval(int);
          if (maxTo) clearTimeout(maxTo);
          resolve(results);
        }
      }, opts.pollRate);
      if (opts.max && opts.max !== -1) {
        maxTo = setTimeout(() => {
          results.predicate = predicate();
          results.maxExceeded = true;
          clearInterval(int);
          resolve(results);
        }, opts.max);
      }
    });
  }
  async function waitForAndSelectElement(fromNode, selector, options) {
    const elem = qs(selector, fromNode);
    if (!elem) {
      const waitRet = await waitForPredicate(
        () => selectorExists(selector, fromNode),
        options
      );
      if (waitRet.predicate) return qs(selector, fromNode);
      return null;
    }
    return elem;
  }
  function waitForElementToBecomeVisible(elem, options) {
    const results = { predicate: false, maxExceeded: false };
    const opts = Object.assign({ pollRate: 1000, max: 15050 }, options);
    return new Promise(resolve => {
      if (!isElemVisible(elem)) {
        results.predicate = true;
        return resolve(results);
      }
      let safety;
      const poll = setInterval(() => {
        if (isElemVisible(elem)) {
          if (safety) clearTimeout(safety);
          clearInterval(poll);
          results.predicate = true;
          return resolve(results);
        }
      }, opts.pollRate);
      if (opts.max !== -1) {
        safety = setTimeout(() => {
          clearInterval(poll);
          results.predicate = isElemVisible(elem);
          results.maxExceeded = true;
          resolve(results);
        }, opts.max);
      }
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

  function stateWithMsgNoWait(msg, state = {}) {
    return { wait: false, msg, state };
  }
  function stateWithMsgWait(msg, state = {}) {
    return { wait: true, msg, state };
  }

  async function noExceptPlayMediaElement(mediaElement, playThrough) {
    if (mediaElement == null || typeof mediaElement.play !== 'function') {
      return false;
    }
    try {
      let playProm;
      if (playThrough) {
        const plp = uaThinksMediaElementCanPlayAllTheWay(mediaElement);
        playProm = Promise.all([mediaElement.play(), plp]);
      } else {
        playProm = mediaElement.play();
      }
      await playProm;
    } catch (e) {
      return false;
    }
    return true;
  }
  function uaThinksMediaElementCanPlayAllTheWay(mediaElement) {
    return new Promise(resolve => {
      let to;
      const listener = () => {
        if (to != null) {
          clearTimeout(to);
          to = null;
        }
        mediaElement.removeEventListener('canplaythrough', listener);
        mediaElement.removeEventListener('error', listener);
        resolve();
      };
      mediaElement.addEventListener('canplaythrough', listener);
      mediaElement.addEventListener('error', listener);
      to = setTimeout(listener, 60000);
    });
  }

  const EpubView = 'div.epub-view';
  const EpubNextPage =
    'a[title="Next Page"][role="button"].cozy-control.cozy-control-next';

  async function waitForReaderToBeVisible() {
    const epubView = await waitForAndSelectElement(document, EpubView);
    if (!isElemVisible(epubView)) {
      await waitForElementToBecomeVisible(epubView);
    }
    await waitForPredicate(() => selectorExists(EpubNextPage));
  }
  async function* checkEpubViewerForMedia() {
    yield stateWithMsgWait('Checking for embeds');
    const viewer = firstChildElementOfSelector(EpubView);
    const displayedDoc = viewer.contentDocument;
    const embeds = qsa('iframe[src*="embed"]', displayedDoc);
    for (let i = 0; i < embeds.length; i++) {
      const embed = embeds[i];
      const vidAudios = qsa('video, audio', embed.contentDocument);
      for (let j = 0; j < vidAudios.length; j++) {
        yield stateWithMsgNoWait('playing video or audio');
        await noExceptPlayMediaElement(vidAudios[j]);
      }
    }
  }
  async function nextPage() {
    const prr = promiseResolveReject();
    let rendered = false;
    const renderedListener = () => {
      rendered = true;
    };
    reader._rendition.once('rendered', renderedListener);
    reader.once('relocated', next => {
      reader._rendition.off('rendered', renderedListener);
      prr.resolve({ next, rendered });
    });
    reader.next();
    return prr.promise;
  }
  async function* behavior(cliAPI) {
    await waitForReaderToBeVisible();
    yield* checkEpubViewerForMedia();
    while (1) {
      const result = await nextPage();
      if (result.next.atEnd) {
        break;
      }
      if (result.rendered) {
        yield* checkEpubViewerForMedia();
      } else {
        yield stateWithMsgNoWait('not done');
      }
      await delay(1500);
    }
    yield stateWithMsgNoWait('done');
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: behavior({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'fulcrumEpubBehavior',
      displayName: 'Fulcrum Epub',
      functional: true,
      match: {
        regex: /https?:\/\/(www\.)?fulcrum\.org\/epubs\/.+/,
      },
      description: 'Views the content of an Epub',
      updated: '2019-09-23T17:19:38-04:00',
    },
  });
})(false);
