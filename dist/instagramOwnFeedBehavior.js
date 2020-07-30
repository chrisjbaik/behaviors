(function runner(debug) {
  function autoFetchFromDoc() {
    if (window.$WBAutoFetchWorker$) {
      window.$WBAutoFetchWorker$.extractFromLocalDoc();
    }
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
  function promiseResolveReject() {
    const promResolveReject = { promise: null, resolve: null, reject: null };
    promResolveReject.promise = new Promise((resolve, reject) => {
      promResolveReject.resolve = resolve;
      promResolveReject.reject = reject;
    });
    return promResolveReject;
  }
  let __BytesToHex__;
  function uuidv4() {
    if (__BytesToHex__ == null) {
      __BytesToHex__ = new Array(256);
      for (let i = 0; i < 256; ++i) {
        __BytesToHex__[i] = (i + 0x100).toString(16).substr(1);
      }
    }
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;
    return [
      __BytesToHex__[randomBytes[0]],
      __BytesToHex__[randomBytes[1]],
      __BytesToHex__[randomBytes[2]],
      __BytesToHex__[randomBytes[3]],
      '-',
      __BytesToHex__[randomBytes[4]],
      __BytesToHex__[randomBytes[5]],
      '-',
      __BytesToHex__[randomBytes[6]],
      __BytesToHex__[randomBytes[7]],
      '-',
      __BytesToHex__[randomBytes[8]],
      __BytesToHex__[randomBytes[9]],
      '-',
      __BytesToHex__[randomBytes[10]],
      __BytesToHex__[randomBytes[11]],
      __BytesToHex__[randomBytes[12]],
      __BytesToHex__[randomBytes[13]],
      __BytesToHex__[randomBytes[14]],
      __BytesToHex__[randomBytes[15]],
    ].join('');
  }
  function isGenerator(obj) {
    if (!obj) return false;
    const tag = obj[Symbol.toStringTag];
    if (tag === 'AsyncGenerator' || tag === 'Generator') return true;
    if (
      isFunction(obj.next) &&
      isFunction(obj.throw) &&
      isFunction(obj.return)
    ) {
      return true;
    }
    if (!obj.constructor) return false;
    const ctag = obj.constructor[Symbol.toStringTag];
    return ctag === 'GeneratorFunction' || ctag === 'AsyncGeneratorFunction';
  }
  function isPromise(obj) {
    if (!obj) return false;
    return (
      obj instanceof Promise ||
      (typeof obj === 'object' &&
        isFunction(obj.then) &&
        isFunction(obj.catch)) ||
      obj[Symbol.toStringTag] === 'Promise'
    );
  }
  function isFunction(obj) {
    return typeof obj === 'function';
  }
  async function* noExceptGeneratorWrap(generator, returnLast) {
    try {
      let next;
      let nv;
      while (true) {
        next = generator.next();
        if (isPromise(next)) nv = await next;
        else nv = next;
        if (nv.done) {
          if (nv.value) {
            if (returnLast) return nv.value;
            else yield nv.value;
          }
          break;
        } else {
          yield nv.value;
        }
      }
    } catch (e) {}
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
  function lastChildElementOf(elem) {
    if (elem != null) return elem.lastElementChild;
    return null;
  }
  function lastChildElementOfSelector(selector, cntx) {
    return lastChildElementOf(qs(selector, cntx));
  }
  function hasClass(elem, clazz) {
    if (elem) return elem.classList.contains(clazz);
    return false;
  }
  function getElemSibling(elem) {
    if (!elem) return null;
    return elem.nextElementSibling;
  }
  function getElemsParentsSibling(elem) {
    if (!elem) return null;
    return getElemSibling(elem.parentElement);
  }
  function elemInnerTextEqsInsensitive(elem, shouldEqual, trim = false) {
    if (elem == null || !elem.innerText) return false;
    const innerText = trim ? elem.innerText.trim() : elem.innerText;
    return innerText.toLowerCase() === shouldEqual;
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
  function anySelectorExists(selectors, cntx) {
    const numSelectors = selectors.length;
    for (var i = 0; i < numSelectors; ++i) {
      if (selectorExists(selectors[i], cntx)) {
        return { idx: i, success: true };
      }
    }
    return { idx: -1, success: false };
  }
  function* childElementIterator(parentElement) {
    if (parentElement == null) return;
    let child = parentElement.firstElementChild;
    while (child != null) {
      yield child;
      child = child.nextElementSibling;
    }
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
  function fireMouseEventsOnElement(config) {
    const { elem, eventNames, view, position, eventOpts, clickCount } = config;
    if (elem != null) {
      const numEvents = eventNames.length;
      for (var eventIdx = 0; eventIdx < numEvents; ++eventIdx) {
        elem.dispatchEvent(
          createMouseEvent({
            type: eventNames[eventIdx],
            elem,
            view,
            position,
            eventOpts,
            clickCount,
          })
        );
      }
    }
  }

  function secondsToDelayAmount(n) {
    return n * 1000;
  }
  function delay(delayTime) {
    return new Promise(resolve => {
      setTimeout(resolve, delayTime || 3000);
    });
  }
  function domCompletePromise() {
    if (document.readyState !== 'complete') {
      return new Promise(r => {
        let i = setInterval(() => {
          if (document.readyState === 'complete') {
            clearInterval(i);
            r();
          }
        }, 1000);
      });
    }
    return Promise.resolve();
  }
  function waitForAdditionalElemChildren(parentElement, options) {
    const opts = Object.assign({ pollRate: 1000, max: 15000 }, options);
    let int;
    let safety;
    const currentChildCount = parentElement.childElementCount;
    const results = { predicate: false, maxExceeded: false };
    return new Promise(resolve => {
      int = setInterval(() => {
        if (!parentElement.isConnected) {
          clearInterval(int);
          if (safety) clearTimeout(safety);
          return resolve(results);
        }
        if (opts.guard && opts.guard()) {
          clearInterval(int);
          if (safety) clearTimeout(safety);
          return resolve(results);
        }
        if (parentElement.childElementCount > currentChildCount) {
          clearInterval(int);
          if (safety) clearTimeout(safety);
          results.predicate = true;
          return resolve(results);
        }
      }, opts.pollRate);
      if (opts.max !== -1) {
        safety = setTimeout(() => {
          clearInterval(int);
          results.predicate =
            parentElement.childElementCount > currentChildCount;
          results.maxExceeded = true;
          resolve(results);
        }, opts.max);
      }
    });
  }
  function waitForAdditionalElemChildrenMO(parentElement, options) {
    const opts = Object.assign({ pollRate: 1000, max: 15000 }, options);
    let maxTo;
    let pollIn;
    const results = { predicate: false, maxExceeded: false };
    const prr = promiseResolveReject();
    let mutatationObz;
    const observer = () => {
      if (maxTo) clearTimeout(maxTo);
      if (pollIn) clearInterval(pollIn);
      results.predicate = true;
      if (mutatationObz) {
        mutatationObz.disconnect();
      }
      prr.resolve(results);
    };
    if (opts.guard && opts.guard()) {
      results.predicate = true;
      prr.resolve(results);
      return prr.promise;
    }
    mutatationObz = new MutationObserver(observer);
    mutatationObz.observe(parentElement, { childList: true });
    if (opts.guard) {
      pollIn = setInterval(() => {
        if (opts.guard()) {
          observer();
        }
      }, opts.pollRate);
    }
    if (opts.max !== -1) {
      maxTo = setTimeout(() => {
        if (pollIn !== -1) clearInterval(pollIn);
        results.maxExceeded = true;
        mutatationObz.disconnect();
        prr.resolve(results);
      }, opts.max);
    }
    return prr.promise;
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

  function waitForHistoryManipToChangeLocation(previousLocation, options) {
    const opts = Object.assign({ pollRate: 1000, max: 5000 }, options);
    let pollInterval;
    let safetyTimeout;
    return new Promise(resolve => {
      if (!locationEquals(previousLocation)) return resolve(true);
      pollInterval = setInterval(() => {
        if (!locationEquals(previousLocation)) {
          if (safetyTimeout) {
            clearTimeout(safetyTimeout);
          }
          clearInterval(pollInterval);
          return resolve(true);
        }
      }, opts.pollRate);
      safetyTimeout = setTimeout(() => {
        if (pollInterval) clearInterval(pollInterval);
        resolve(!locationEquals(previousLocation));
      }, opts.max);
    });
  }
  function locationEquals(someLocation) {
    return window.location.href === someLocation;
  }

  let isBadFF;
  function scrollIntoView(elem, opts) {
    if (elem == null) return;
    if (isBadFF == null) {
      isBadFF = /Firefox\/57(?:\.[0-9]+)?/i.test(window.navigator.userAgent);
    }
    const defaults = isBadFF
      ? { behavior: 'smooth', inline: 'center' }
      : {
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        };
    elem.scrollIntoView(
      opts && typeof opts === 'object'
        ? Object.assign(defaults, opts)
        : defaults
    );
  }
  function scrollIntoViewWithDelay(elem, delayTime) {
    scrollIntoView(elem);
    return delay(delayTime || 1000);
  }
  function canScrollDownMore() {
    return (
      window.scrollY + window.innerHeight <
      Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.body.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      )
    );
  }
  function canScrollUpMore() {
    return window.scrollY !== 0;
  }
  function scrollWindowBy(x, y) {
    window.scrollBy(x, y);
  }
  function createScrollAmount(desiredTimesToScroll) {
    let docsBoundingCRect = document.documentElement.getBoundingClientRect();
    const getMaxUpDown = () =>
      Math.max(
        document.scrollingElement.scrollHeight,
        document.documentElement.scrollHeight,
        docsBoundingCRect.bottom
      );
    const getMaxLeftRight = () =>
      Math.max(
        document.scrollingElement.scrollWidth,
        document.documentElement.scrollWidth,
        docsBoundingCRect.right
      );
    let lastUpDownMax = getMaxUpDown();
    let lastLeftRightMax = getMaxLeftRight();
    return {
      timesToScroll: desiredTimesToScroll || 10,
      get scrollUpDownAmount() {
        let currentMax = getMaxUpDown();
        if (currentMax !== lastUpDownMax) {
          docsBoundingCRect = document.documentElement.getBoundingClientRect();
          currentMax = getMaxUpDown();
          lastUpDownMax = currentMax;
        }
        return currentMax / this.timesToScroll;
      },
      get scrollLeftRightAmount() {
        let currentMax = getMaxLeftRight();
        if (currentMax !== lastLeftRightMax) {
          docsBoundingCRect = document.documentElement.getBoundingClientRect();
          currentMax = getMaxLeftRight();
          lastLeftRightMax = currentMax;
        }
        return currentMax / this.timesToScroll;
      },
    };
  }
  function createScroller(timesToScroll) {
    const scrollAmount = createScrollAmount(timesToScroll || 10);
    return Object.assign(
      {
        canScrollDownMore,
        canScrollUpMore,
        scrollDown() {
          scrollWindowBy(0, this.scrollUpDownAmount);
        },
        scrollUp() {
          scrollWindowBy(0, -this.scrollUpDownAmount);
        },
        scrollLeft() {
          scrollWindowBy(-this.scrollLeftRightAmount, 0);
        },
        scrollRight() {
          scrollWindowBy(this.scrollLeftRightAmount, 0);
        },
      },
      scrollAmount
    );
  }

  let __currentClickCount = 0;
  const __clickPreEvents = ['mousemove', 'mouseover', 'mousedown', 'mouseup'];
  function click(elem) {
    let clicked = false;
    if (elem != null) {
      fireMouseEventsOnElement({
        elem,
        eventNames: __clickPreEvents,
        clickCount: __currentClickCount,
      });
      __currentClickCount += 1;
      elem.click();
      elem.dispatchEvent(
        createMouseEvent({
          type: 'mouseleave',
          elem,
          clickCount: __currentClickCount,
        })
      );
      clicked = true;
    }
    return clicked;
  }
  async function clickWithDelay(elem, delayTime) {
    let clicked = click(elem);
    if (clicked) {
      await delay(delayTime || 1000);
    }
    return clicked;
  }

  function setMediaElemPlaybackRate(mediaElem, rate) {
    if (!mediaElem) return;
    const originalPlaybackRate = mediaElem.playbackRate;
    let good = false;
    let mediaRate = 16.0;
    if (rate && typeof rate === 'number') {
      mediaRate = rate > 1 ? rate : mediaRate;
    }
    for (; mediaRate > 1.0; mediaRate -= 0.25) {
      try {
        mediaElem.playbackRate = mediaRate;
        good = true;
        break;
      } catch (e) {}
    }
    if (!good) {
      mediaElem.playbackRate =
        originalPlaybackRate > 0 ? originalPlaybackRate : 1;
    }
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
  const __MediaElementSelector__ = 'audio, video';
  let __Played__;
  async function findAllMediaElementsAndPlay(cntx) {
    if (__Played__ == null) __Played__ = Symbol(uuidv4());
    const mediaElems = qsa(__MediaElementSelector__, cntx);
    if (mediaElems.length === 0) return false;
    const proms = [];
    let shouldWait = false;
    for (var i = 0; i < mediaElems.length; i++) {
      const mediaElem = mediaElems[i];
      if (!mediaElem[__Played__]) {
        setMediaElemPlaybackRate(mediaElem, 10.0);
        proms.push(noExceptPlayMediaElement(mediaElem));
        Object.defineProperty(mediaElem, __Played__, {
          value: true,
          enumerable: false,
        });
        shouldWait = true;
      }
    }
    if (proms.length) {
      await Promise.all(proms);
    }
    return shouldWait;
  }

  let __outlinksSet__;
  const ignoredSchemes = [
    'about:',
    'data:',
    'mailto:',
    'javascript:',
    'js:',
    '{',
    '*',
    'ftp:',
    'tel:',
  ];
  const goodSchemes = { 'http:': true, 'https:': true };
  const outlinkSelector = 'a[href], area[href]';
  let outLinkURLParser;
  let didInit = false;
  function initOutlinkCollection() {
    didInit = true;
    outLinkURLParser = new URL('about:blank');
    if (window.$wbOutlinkSet$ == null) {
      __outlinksSet__ = new Set();
      Object.defineProperty(window, '$wbOutlinkSet$', {
        value: __outlinksSet__,
        enumerable: false,
      });
    } else {
      window.$wbOutlinkSet$.clear();
      __outlinksSet__ = window.$wbOutlinkSet$;
    }
    if (typeof window.$wbOutlinks$ === 'undefined') {
      Object.defineProperty(window, '$wbOutlinks$', {
        get() {
          const outlinks = Array.from(__outlinksSet__);
          __outlinksSet__.clear();
          return outlinks;
        },
        set() {},
        enumerable: false,
      });
    }
  }
  function shouldIgnoreLink(test) {
    for (let i = 0; i < ignoredSchemes.length; ++i) {
      if (test.startsWith(ignoredSchemes[i])) {
        return true;
      }
    }
    let parsed = true;
    try {
      outLinkURLParser.href = test;
    } catch (error) {
      parsed = false;
    }
    return !(parsed && goodSchemes[outLinkURLParser.protocol]);
  }
  function addOutLinks(toAdd) {
    if (window.$WBNOOUTLINKS) {
      return;
    }
    if (!didInit) initOutlinkCollection();
    let href;
    for (var i = 0; i < toAdd.length; i++) {
      href = toAdd[i].href.trim();
      if (href && !__outlinksSet__.has(href) && !shouldIgnoreLink(href)) {
        __outlinksSet__.add(href);
      }
    }
  }
  function collectOutlinksFromDoc() {
    if (window.$WBNOOUTLINKS) {
      return;
    }
    if (!didInit) initOutlinkCollection();
    addOutLinks(document.querySelectorAll(outlinkSelector));
  }
  function collectOutlinksFrom(queryFrom) {
    if (window.$WBNOOUTLINKS) {
      return;
    }
    if (!didInit) initOutlinkCollection();
    addOutLinks(queryFrom.querySelectorAll(outlinkSelector));
  }

  async function* walkChildrenOfCustom(opts) {
    if (!opts) return;
    const {
      parentElement,
      waitOptions,
      selector,
      filter,
      nextChild = (parent, child) => child.nextElementSibling,
    } = opts;
    let isLoader = !!opts.loader;
    if (!isLoader && (isFunction(opts.shouldWait) || isFunction(opts.wait))) {
      isLoader = true;
    }
    let shouldWait;
    let wait;
    if (isLoader) {
      shouldWait = isFunction(opts.shouldWait)
        ? opts.shouldWait
        : (parent, child) => child.nextElementSibling == null;
      wait = isFunction(opts.wait)
        ? opts.wait
        : (parent, child) => waitForAdditionalElemChildren(parent, waitOptions);
    }
    let curChild = parentElement.firstElementChild;
    let useChild;
    let nextChildValue;
    while (curChild != null) {
      useChild = filter ? filter(curChild) : true;
      if (isPromise(useChild) ? await useChild : useChild) {
        yield selector ? selector(curChild) : curChild;
      }
      if (isLoader) {
        const shouldWaitValue = shouldWait(parentElement, curChild);
        if (
          isPromise(shouldWaitValue) ? await shouldWaitValue : shouldWaitValue
        ) {
          await wait(parentElement, curChild);
        }
      }
      nextChildValue = nextChild(parentElement, curChild);
      curChild = isPromise(nextChildValue)
        ? await nextChildValue
        : nextChildValue;
    }
  }
  async function* traverseChildrenOfCustom(opts) {
    if (!opts) return;
    if (isFunction(opts.preTraversal)) {
      const preValue = opts.preTraversal();
      if (isGenerator(preValue)) {
        for await (const preNext of noExceptGeneratorWrap(preValue)) {
          yield preNext;
        }
      } else if (isPromise(preValue)) {
        await preValue;
      }
    }
    let parentElement;
    if (isFunction(opts.setup)) {
      const parentElemOrPromise = opts.setup();
      parentElement = isPromise(parentElemOrPromise)
        ? await parentElemOrPromise
        : parentElemOrPromise;
    } else {
      parentElement = opts.parentElement;
    }
    if (!parentElement) {
      if (opts.setupFailure) {
        const handlingFailure = isFunction(opts.setupFailure)
          ? opts.setupFailure()
          : opts.setupFailure;
        if (isGenerator(handlingFailure)) {
          for await (const failureNext of noExceptGeneratorWrap(
            handlingFailure
          )) {
            yield failureNext;
          }
        } else {
          yield handlingFailure;
        }
      }
      if (isFunction(opts.postTraversal)) {
        const postValue = opts.postTraversal(true);
        if (isGenerator(postValue)) {
          try {
            let next;
            let nv;
            while (true) {
              next = postValue.next();
              nv = isPromise(next) ? await next : next;
              if (nv.done) {
                if (nv.value) return nv.value;
                break;
              } else {
                yield nv.value;
              }
            }
          } catch (e) {}
        } else if (postValue) return postValue;
      }
      return;
    }
    for await (const child of walkChildrenOfCustom({
      parentElement,
      loader: opts.loader,
      nextChild: opts.nextChild,
      shouldWait: opts.shouldWait,
      wait: opts.wait,
      waitOptions: opts.waitOptions,
      filter: opts.filter,
      selector: opts.selector,
    })) {
      const nextValue = opts.handler(child, opts.additionalArgs);
      if (isGenerator(nextValue)) {
        for await (const next of noExceptGeneratorWrap(nextValue)) {
          yield next;
        }
      } else if (nextValue) {
        yield nextValue;
      }
    }
    if (isFunction(opts.postTraversal)) {
      const postValue = opts.postTraversal(false);
      if (isGenerator(postValue)) {
        try {
          let next;
          let nv;
          while (true) {
            next = postValue.next();
            nv = isPromise(next) ? await next : next;
            if (nv.done) {
              if (nv.value) return nv.value;
            } else {
              yield nv.value;
            }
          }
        } catch (e) {}
      } else if (postValue) {
        return postValue;
      }
    }
  }

  const userNextStory = 'div[class*="RightChevron" i]';
  const userStoryVideo = 'button.videoSpritePlayButton';
  const userMultiImagePostSelectors = [
    'span[aria-label*="Carousel" i]',
    'span[class*="SpriteCarousel" i]',
    'span.coreSpriteSidecarIconLarge',
  ];
  const userVideoPostSelectors = [
    'span[role="button"].videoSpritopePlayButton',
    'span[aria-label*="Video" i]',
    'span[class*="SpriteVideo" i]',
    'span.coreSpriteVideoIconLarge',
    'span[aria-label$="Video" i]',
    'span[class*="glyphsSpriteVideo_large"]',
  ];
  const postNextImage = 'div.coreSpriteRightChevron';
  const videoSpritePlayButton = '.videoSpritePlayButton';
  const postMultiImagePostSelectors = [
    'button > div.coreSpriteRightChevron',
    'div.coreSpriteRightChevron',
  ];
  const postVideoPostSelectors = [
    'span[role="button"].videoSpritePlayButton',
    'span.videoSpritePlayButton',
  ];
  const nextImageIconDiv = 'button > div[class*="RightChevron" i]';
  const notLoggedInXpaths = {
    signUp: '//a[contains(text(), "Sign Up")]',
    login: '//button[contains(text(), "Log In")]',
  };

  const postTypes = {
    video: Symbol('$$instagram-video-post$$'),
    multiImage: Symbol('$$instagram-multi-image-post$$'),
    commentsOnly: Symbol('$$instagram-comments-only-post$$'),
  };
  const ViewingOwnTimeline = Symbol('$$instagram-viewing-own-timeline');
  const ViewingUser = Symbol('$$instagram-viewing-user$$');
  const ViewingSinglePost = Symbol('$$instagram-viewing-single-post$$');
  function isVideoPost(post, viewing) {
    let selectors_;
    switch (viewing) {
      case ViewingOwnTimeline:
      case ViewingSinglePost:
        selectors_ = postVideoPostSelectors;
        break;
      default:
        selectors_ = userVideoPostSelectors;
        break;
    }
    return anySelectorExists(selectors_, post).success;
  }
  function isMultiImagePost(post, viewing) {
    if (viewing === ViewingOwnTimeline) {
      return selectorExists(nextImageIconDiv, post);
    }
    const selectors_ =
      viewing === ViewingUser
        ? userMultiImagePostSelectors
        : postMultiImagePostSelectors;
    return anySelectorExists(selectors_, post).success;
  }
  function determinePostType(post, viewing) {
    if (isMultiImagePost(post, viewing)) return postTypes.multiImage;
    if (isVideoPost(post, viewing)) return postTypes.video;
    return postTypes.commentsOnly;
  }
  function getVideoPlayButton(postContent) {
    const playButton = qs(videoSpritePlayButton, postContent);
    if (!playButton) return null;
    const maybeNewPlayButton = getElemsParentsSibling(playButton);
    let useNewPlayButton = false;
    if (maybeNewPlayButton) {
      useNewPlayButton = elemInnerTextEqsInsensitive(
        firstChildElementOf(maybeNewPlayButton),
        'control'
      );
    }
    return useNewPlayButton ? maybeNewPlayButton : playButton;
  }
  async function playPostVideo(postContent) {
    const video = qs('video', postContent);
    const playButton = getVideoPlayButton(postContent);
    if (!playButton || !video) return;
    setMediaElemPlaybackRate(video, 10);
    const loadedPromise = uaThinksMediaElementCanPlayAllTheWay(video);
    await Promise.all([clickWithDelay(playButton), loadedPromise]);
  }
  async function viewMultiPost(content, viewing) {
    let numMulti = 0;
    const NextPart = qs(
      viewing === ViewingSinglePost ? postNextImage : nextImageIconDiv,
      content
    );
    const multiList = qs('ul', content);
    if (!multiList) return 0;
    for (const postPart of childElementIterator(multiList)) {
      collectOutlinksFrom(postPart);
      numMulti += 1;
      if (selectorExists('video', postPart)) {
        await playPostVideo(postPart);
      }
      await clickWithDelay(NextPart);
    }
    return numMulti;
  }
  async function handlePostContent(postDetails) {
    const { thePost, content, viewing, info, postId } = postDetails;
    const baseMsg = `Viewed the contents of ${postId}`;
    const result = { msg: '', wait: false, state: info.state };
    switch (determinePostType(thePost, viewing)) {
      case postTypes.multiImage:
        const n = await viewMultiPost(content, viewing);
        result.msg = `${baseMsg} that had #${n} images or videos`;
        break;
      case postTypes.video:
        await playPostVideo(content);
        result.msg = `${baseMsg} that had a video`;
        result.wait = true;
        break;
      default:
        result.msg = baseMsg;
        break;
    }
    autoFetchFromDoc();
    collectOutlinksFrom(thePost);
    return result;
  }
  async function* viewStories(startStoriesElem, info, selected) {
    const typeOfStory = selected ? 'selected stories' : 'stories';
    const originalLoc = window.location.href;
    if (!click(startStoriesElem)) {
      return stateWithMsgNoWait(
        `Failed to start the viewing of ${typeOfStory}`,
        info.state
      );
    }
    await waitForHistoryManipToChangeLocation(originalLoc);
    let wasClicked;
    let videoButton;
    let msg;
    let toBeClicked = qs(userNextStory);
    collectOutlinksFromDoc();
    while (!locationEquals(originalLoc) && toBeClicked != null) {
      wasClicked = await clickWithDelay(toBeClicked);
      if (!wasClicked || locationEquals(originalLoc)) break;
      videoButton = qs(userStoryVideo);
      if (videoButton) {
        let maybeVideo = qs('video');
        if (maybeVideo) {
          await clickWithDelay(videoButton);
        }
        if (locationEquals(originalLoc)) break;
        if (maybeVideo && maybeVideo.paused) {
          await noExceptPlayMediaElement(maybeVideo);
        }
        msg = `Viewed a video included in the ${typeOfStory}`;
      } else {
        msg = `Viewed a post of the ${typeOfStory}`;
      }
      yield stateWithMsgNoWait(msg, info.state);
      if (locationEquals(originalLoc)) break;
      toBeClicked = qs(userNextStory);
    }
    return info.viewedStories(selected);
  }
  function loggedIn(xpg) {
    return (
      hasClass(document.documentElement, 'logged-in') ||
      (xpg(notLoggedInXpaths.login).length === 0 &&
        xpg(notLoggedInXpaths.signUp).length === 0)
    );
  }

  const specialActions = [
    {
      rx: /w\.soundcloud\.com/,
      check(url) {
        if (url.href.search(this.rx) >= 0) {
          const autoplay = url.searchParams.get('auto_play');
          return autoplay !== 'true';
        }
        return false;
      },
      handle(iframe, url) {
        url.searchParams.set('auto_play', 'true');
        url.searchParams.set('continuous_play', 'true');
        iframe.src = url.href;
      },
    },
    {
      rx: [/player\.vimeo\.com/, /youtube\.com\/embed\//],
      check(url) {
        for (let i = 0; i < this.rx.length; i++) {
          if (url.href.search(this.rx[i]) >= 0) {
            const autoplay = url.searchParams.get('autoplay');
            return autoplay !== '1';
          }
        }
        return false;
      },
      handle(iframe, url) {
        url.searchParams.set('autoplay', '1');
        iframe.src = url.href;
      },
    },
  ];
  function checkForIframeEmbeds() {
    const iframes = document.getElementsByTagName('IFRAME');
    for (let i = 0; i < iframes.length; i++) {
      const iframeSrc = iframes[i].src;
      if (iframeSrc) {
        try {
          const srcURL = new URL(iframeSrc);
          for (let j = 0; j < specialActions.length; j++) {
            const specialAction = specialActions[j];
            if (specialAction.check(srcURL)) {
              specialAction.handle(iframes[i], srcURL);
              break;
            }
          }
        } catch (e) {}
      }
    }
  }
  async function* autoScrollBehavior(init) {
    const state = { timesScrolled: 0, timesWaited: 0 };
    if (init && typeof init.fallbackMsg === 'string') {
      yield stateWithMsgNoWait(init.fallbackMsg, state);
    } else {
      yield stateWithMsgNoWait('Beginning scroll', state);
    }
    const maxScroll = 50;
    await domCompletePromise();
    const scroller = createScroller();
    autoFetchFromDoc();
    collectOutlinksFromDoc();
    while (scroller.canScrollDownMore()) {
      let localTimesScrolled = 0;
      while (scroller.canScrollDownMore() && localTimesScrolled < maxScroll) {
        scroller.scrollDown();
        state.timesScrolled++;
        if (await findAllMediaElementsAndPlay()) {
          yield stateWithMsgWait('Auto scroll played some media', state);
        }
        if (localTimesScrolled % 5 === 0) checkForIframeEmbeds();
        localTimesScrolled++;
        autoFetchFromDoc();
        await delay(500);
      }
      autoFetchFromDoc();
      collectOutlinksFromDoc();
      state.timesWaited += 1;
      yield stateWithMsgWait('Auto scroll waiting for network idle', state);
    }
    checkForIframeEmbeds();
    return stateWithMsgNoWait('Auto scroll finished', state);
  }

  function instagramOwnFeedBehavior(cliAPI) {
    if (!loggedIn(cliAPI.$x)) return autoScrollBehavior();
    const info = {
      state: {
        viewed: 0,
        viewedFully: 0,
        viewedStories: false,
      },
      viewedStories() {
        return stateWithMsgNoWait('Viewed stories', this.state);
      },
    };
    return traverseChildrenOfCustom({
      preTraversal() {
        const startStories = qs(
          'a[href="#"]',
          lastChildElementOfSelector('main > section')
        );
        if (startStories) {
          return viewStories(startStories, info);
        }
      },
      setup() {
        const firstPost = qs(
          'article',
          firstChildElementOfSelector('main > section')
        );
        if (firstPost) {
          return firstPost.parentElement;
        }
        return null;
      },
      loader: true,
      async nextChild(parentElement, currentRow) {
        const nextRow = getElemSibling(currentRow);
        if (nextRow) {
          await scrollIntoViewWithDelay(nextRow);
        }
        return nextRow;
      },
      shouldWait(parentElement, currentRow) {
        return currentRow.nextElementSibling == null;
      },
      wait(parentElement, currentRow) {
        const previousChildCount = parentElement.childElementCount;
        return waitForAdditionalElemChildrenMO(parentElement, {
          max: secondsToDelayAmount(45),
          pollRate: secondsToDelayAmount(2.5),
          guard() {
            return previousChildCount !== parentElement.childElementCount;
          },
        });
      },
      async handler(post, additionalArgs) {
        let result;
        try {
          result = await handlePostContent({
            viewing: ViewingOwnTimeline,
            thePost: post,
            content: post,
            info,
            postId: 'a post',
          });
        } catch (e) {
          result = stateWithMsgNoWait(
            'An error occurred while handling a post',
            info.state
          );
        }
        return result;
      },
      setupFailure() {
        collectOutlinksFromDoc();
        autoFetchFromDoc();
        return autoScrollBehavior();
      },
      postTraversal(failure) {
        const msg = failure
          ? 'Behavior finished due to failure to find posts container, reverted to auto scroll'
          : 'Viewed all posts in the timeline';
        return stateWithMsgNoWait(msg, info.state);
      },
    });
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: instagramOwnFeedBehavior({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'instagramOwnFeedBehavior',
      displayName: 'Instagram User Feed',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?instagram\.com(?:\/)?$/,
      },
      description:
        'Capture all stories, images, videos and comments on the logged in users feed.',
      updated: '2019-10-11T17:08:12-04:00',
    },
  });
})(false);
