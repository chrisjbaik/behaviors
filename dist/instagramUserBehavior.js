(function runner(debug) {
  function getViaPath(obj, ...pathItems) {
    if (obj == null || pathItems.length === 0) return null;
    let cur = obj[pathItems[0]];
    for (let i = 1; i < pathItems.length; i++) {
      cur = cur[pathItems[i]];
      if (cur == null) return null;
    }
    return cur;
  }
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
  function objectInstanceOf(obj, shouldBeInstanceOfThis) {
    if (!obj) return false;
    return obj instanceof shouldBeInstanceOfThis;
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
  function id(eid, context) {
    if (context != null) return context.getElementById(eid);
    return document.getElementById(eid);
  }
  function selectorExists(selector, cntx) {
    return qs(selector, cntx) != null;
  }
  function firstChildElementOf(elem) {
    if (elem != null) return elem.firstElementChild;
    return null;
  }
  function chainFistChildElemOf(elem, times) {
    if (elem == null) return null;
    let child = elem;
    for (var i = 0; i < times; ++i) {
      child = firstChildElementOf(child);
      if (child == null) break;
    }
    return child;
  }
  function hasClass(elem, clazz) {
    if (elem) return elem.classList.contains(clazz);
    return false;
  }
  function elemMatchesSelector(elem, selector) {
    if (!elem) return false;
    return elem.matches(selector);
  }
  function getElemSibling(elem) {
    if (!elem) return null;
    return elem.nextElementSibling;
  }
  function getElemsParentsSibling(elem) {
    if (!elem) return null;
    return getElemSibling(elem.parentElement);
  }
  function elemInnerText(elem, trim) {
    if (elem != null && elem.innerText != null) {
      return trim ? elem.innerText.trim() : elem.innerText;
    }
    return null;
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
  function elementsNameEquals(elem, name) {
    if (!elem) return false;
    return elem.localName === name;
  }
  function xpathOneOf({ queries, xpg, context }) {
    let results = null;
    for (var i = 0; i < queries.length; i++) {
      results = xpg(queries[i], context);
      if (results.length || results.snapshotLength) return results;
    }
    return results;
  }
  function* repeatedXpathQueryIterator(query, cntx, generateMoreElements) {
    let snapShot = xpathSnapShot(query, cntx);
    const haveGenMore = typeof generateMoreElements === 'function';
    while (snapShot.snapshotLength > 0) {
      for (let i = 0; i < snapShot.snapshotLength; i++) {
        yield snapShot.snapshotItem(i);
      }
      snapShot = xpathSnapShot(query, cntx);
      if (snapShot.snapshotLength === 0) {
        if (haveGenMore) generateMoreElements();
        snapShot = xpathSnapShot(query, cntx);
      }
    }
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

  const DelayAmount2Seconds = 2000;
  function secondsToDelayAmount(n) {
    return n * 1000;
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
  function scrollIntoViewAndClickWithDelay(elem, delayTime) {
    scrollIntoView(elem);
    return clickWithDelay(elem, delayTime || 1000);
  }
  async function selectScrollIntoViewAndClickWithDelayWhileSelectedConnected(
    selector,
    options = {}
  ) {
    let selected = qs(selector, options.cntx);
    const haveStopPred = typeof options.stopPredicate === 'function';
    while (selected) {
      if (!selected.isConnected) break;
      await scrollIntoViewAndClickWithDelay(selected, options.delay);
      if (haveStopPred && options.stopPredicate(selected)) break;
      selected = qs(selector, options.cntx);
    }
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

  function findReduxStore(startingComponent) {
    if (!startingComponent) return null;
    let component;
    const q = [startingComponent];
    while (q.length) {
      component = q.shift();
      if (component.memoizedProps && component.memoizedProps.store) {
        return component.memoizedProps.store;
      }
      if (component.child) {
        q.push(component.child);
      }
      if (component.sibling) {
        q.push(component.sibling);
      }
    }
    return null;
  }

  async function* traverseChildrenOf(parentElement, fn, additionalArgs) {
    if (parentElement == null) return;
    for (const child of childElementIterator(parentElement)) {
      const nextValue = fn(child, additionalArgs);
      if (isGenerator(nextValue)) {
        for await (const next of noExceptGeneratorWrap(nextValue)) {
          yield next;
        }
      } else {
        yield isPromise(nextValue) ? await nextValue : nextValue;
      }
    }
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

  const userOpenStories = 'div[aria-label="Open Stories"]';
  const userNextStory = 'div[class*="RightChevron" i]';
  const userStoryVideo = 'button.videoSpritePlayButton';
  const userPostTopMostContainer = 'article';
  const userDivDialog = 'div[role="dialog"]';
  const userPostInfo =
    'section > main > div > header > section > ul > li > span > span';
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
  const postersOwnComment = 'li[role="menuitem"]';
  const moreCommentsSpanSelector = '* > span[aria-label*="more comments" i]';
  const nextImageIconDiv = 'button > div[class*="RightChevron" i]';
  const moreRepliesXpath = '//span[contains(text(), "View replies")]';
  const postPopupCloseXpath = [
    '//body/div/div/button[contains(text(), "Close")]',
    '/html/body/div[2]/button[1][contains(text(), "Close")]',
  ];
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
  function postId(maybePostA) {
    if (maybePostA) {
      const postPath = maybePostA.pathname;
      const slashBehindId = postPath.indexOf('/', 1);
      return `post ${postPath.substring(
        slashBehindId + 1,
        postPath.lastIndexOf('/')
      )}`;
    }
    return 'post';
  }
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
  async function* viewComments({ commentList, info, postId, $x }) {
    if (selectorExists(moreCommentsSpanSelector, commentList)) {
      yield stateWithMsgNoWait(
        `Loading additional comments for the ${postId}`,
        info.state
      );
      await selectScrollIntoViewAndClickWithDelayWhileSelectedConnected(
        moreCommentsSpanSelector,
        { cntx: commentList }
      );
      yield stateWithMsgNoWait(
        `Additional comments loaded for the ${postId}, loading comment replies`,
        info.state
      );
    } else {
      yield stateWithMsgNoWait(`Loading ${postId} comment replies`, info.state);
    }
    let viewedPostersOwnComment = false;
    let numReplies = 0;
    for (const comment of childElementIterator(commentList)) {
      collectOutlinksFrom(comment);
      await scrollIntoViewWithDelay(comment, 250);
      if (
        !viewedPostersOwnComment &&
        elemMatchesSelector(comment, postersOwnComment)
      ) {
        viewedPostersOwnComment = true;
      } else {
        for (const loadMoreReplies of repeatedXpathQueryIterator(
          moreRepliesXpath,
          comment
        )) {
          numReplies++;
          await scrollIntoViewAndClickWithDelay(loadMoreReplies);
        }
      }
    }
    yield stateWithMsgNoWait(
      `Loaded ${numReplies} additional comment replies for ${postId}`,
      info.state
    );
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
  function userLoadingInfo() {
    const info = {
      postsByUserId: null,
      userId: null,
      store: null,
      ok: false,
      allLoaded: false,
      state: {
        viewedFully: 0,
        total: 0,
        viewedStories: false,
        viewedSelectedStories: false,
      },
      viewingPost(postId) {
        return stateWithMsgNoWait(`Viewing ${postId}`, this.state);
      },
      viewedPostRow() {
        this.state.viewedFully += 3;
        return stateWithMsgNoWait('Viewed three posts', this.state);
      },
      fullyViewedPost(postId) {
        this.state.viewedFully++;
        return stateWithMsgNoWait(`Viewed ${postId}`, this.state);
      },
      viewedStories(selected) {
        if (selected) {
          this.state.viewedStories = true;
        } else {
          this.state.viewedSelectedStories = true;
        }
        return stateWithMsgNoWait(
          selected ? 'Viewed selected stories' : 'Viewed stories',
          this.state
        );
      },
      hasMorePosts() {
        if (this.store) {
          if (this.allLoaded) return false;
          return this.postsByUserId.get(this.userId).pagination.hasNextPage;
        }
        return this.state.viewed < this.total;
      },
      storeUpdate() {
        const nextState = this.store.getState();
        if (this.postsByUserId !== nextState.profilePosts.byUserId) {
          this.postsByUserId = nextState.profilePosts.byUserId;
        }
      },
    };
    const user = getViaPath(
      window,
      '_sharedData',
      'entry_data',
      'ProfilePage',
      0,
      'graphql',
      'user'
    );
    const initFromStore = (() => {
      const root = getViaPath(
        id('react-root'),
        '_reactRootContainer',
        '_internalRoot'
      );
      if (!root) return false;
      const store = findReduxStore(root.current);
      if (!store) return false;
      const postsByUserId = getViaPath(
        store.getState(),
        'profilePosts',
        'byUserId'
      );
      if (!postsByUserId) return false;
      let userId = Object.keys(postsByUserId.toJS())[0];
      if (!userId || !postsByUserId.get(userId)) {
        if (user && postsByUserId.get(user.id)) {
          userId = user.id;
        } else {
          return false;
        }
      }
      info.store = store;
      info.userId = userId;
      info.postsByUserId = postsByUserId;
      info.state.total = postsByUserId.get(userId).count;
      info.ok = true;
      info.allLoaded = !(
        getViaPath(postsByUserId.get(userId), 'pagination', 'hasNextPage') ||
        false
      );
      if (typeof window.$____$UNSUB$____$ === 'function') {
        window.$____$UNSUB$____$();
      }
      window.$____$UNSUB$____$ = store.subscribe(info.storeUpdate.bind(info));
      return true;
    })();
    if (initFromStore) return info;
    info.state.total = getViaPath(
      user,
      'edge_owner_to_timeline_media',
      'count'
    );
    if (typeof info.state.total !== 'number') {
      const postCount = (elemInnerText(qs(userPostInfo)) || '').trim();
      const pcNumber = Number(postCount);
      if (postCount && !isNaN(pcNumber)) {
        info.state.total = pcNumber;
      }
    }
    info.ok = typeof info.state.total === 'number';
    return info;
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

  function extractPostPopupElem(postPopup) {
    const innerDivDialog = qs(userDivDialog, postPopup);
    const maybeCloseButton = getElemSibling(innerDivDialog);
    const closeButton = elementsNameEquals(maybeCloseButton, 'button')
      ? maybeCloseButton
      : null;
    const content = qs(userPostTopMostContainer, innerDivDialog);
    return { innerDivDialog, closeButton, content };
  }
  async function openPost(maybeA) {
    await clickWithDelay(maybeA);
    return waitForAndSelectElement(document, userDivDialog);
  }
  function closePost(closeButton, cliAPI) {
    if (closeButton != null) {
      return clickWithDelay(closeButton);
    }
    const found = xpathOneOf({
      xpg: cliAPI.$x,
      queries: postPopupCloseXpath,
    });
    return clickWithDelay(found.length ? found[0] : found.snapshotItem(0));
  }
  async function* handlePost(post, { cliAPI, info }) {
    autoFetchFromDoc();
    let maybeA = firstChildElementOf(post);
    if (!objectInstanceOf(maybeA, window.HTMLAnchorElement)) {
      maybeA = qs('a', maybeA);
    }
    if (!maybeA) {
      collectOutlinksFrom(post);
      return stateWithMsgNoWait('Encountered a non-post', info.state);
    }
    const postId$1 = postId(maybeA);
    const popupDialog = await openPost(maybeA);
    if (!popupDialog) {
      return stateWithMsgNoWait(
        `Failed to open ${postId$1} for viewing`,
        info.state
      );
    }
    yield info.viewingPost(postId$1);
    collectOutlinksFrom(popupDialog);
    const { content, closeButton } = extractPostPopupElem(popupDialog);
    let result;
    try {
      result = await handlePostContent({
        thePost: post,
        viewing: ViewingUser,
        content,
        info,
        postId: postId$1,
      });
    } catch (e) {
      result = stateWithMsgNoWait(
        `An error occurred while viewing the contents of the post (${postId$1})`,
        info.state
      );
    }
    yield result;
    const commentList = qs('ul', content);
    if (commentList) {
      for await (const commentInfo of viewComments({
        commentList,
        info,
        postId: postId$1,
        $x: cliAPI.$x,
      })) {
        yield commentInfo;
      }
    }
    yield info.fullyViewedPost(postId$1);
    await closePost(closeButton, cliAPI);
  }
  function viewStoriesAndLoadPostView(cliAPI, info) {
    return async function* preTraversal() {
      if (loggedIn(cliAPI.$x)) {
        const profilePic = qs('img[alt*="profile picture"]');
        if (
          profilePic &&
          window.getComputedStyle(profilePic).cursor === 'pointer'
        ) {
          yield* viewStories(profilePic, info, true);
        }
        if (selectorExists(userOpenStories)) {
          yield* viewStories(qs(userOpenStories), info);
        }
      }
      yield stateWithMsgNoWait('Loading single post view', info.state);
      const initialArticle = qs('article');
      const firstPostA = qs('a', initialArticle);
      const firstPostHref = firstPostA.href;
      const origLoc = window.location.href;
      const popup = await openPost(firstPostA);
      const { closeButton } = extractPostPopupElem(popup);
      await delay(DelayAmount2Seconds);
      await closePost(closeButton, cliAPI);
      window.history.replaceState({}, '', firstPostHref);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      let postArticle = null;
      await waitForPredicate(() => {
        postArticle = qs('article');
        return postArticle !== initialArticle;
      });
      window.history.replaceState({}, '', origLoc);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      let initialAgainArticle = null;
      await waitForPredicate(() => {
        initialAgainArticle = qs('article');
        return initialAgainArticle !== postArticle;
      });
      yield stateWithMsgNoWait('Done loading single post view', info.state);
    };
  }
  function instagramUserBehavior(cliAPI) {
    const info = userLoadingInfo();
    return traverseChildrenOfCustom({
      preTraversal: viewStoriesAndLoadPostView(cliAPI, info),
      additionalArgs: { cliAPI, info },
      async setup() {
        const parent = chainFistChildElemOf(qs(userPostTopMostContainer), 2);
        if (parent) {
          await scrollIntoViewWithDelay(parent.firstElementChild);
        }
        return parent;
      },
      async nextChild(parentElement, currentRow) {
        const nextRow = getElemSibling(currentRow);
        if (nextRow) {
          await scrollIntoViewWithDelay(nextRow);
        }
        return nextRow;
      },
      shouldWait(parentElement, currentRow) {
        if (currentRow.nextElementSibling != null) return false;
        if (info) return info.hasMorePosts();
        return true;
      },
      wait(parentElement, currentRow) {
        const previousChildCount = parentElement.childElementCount;
        return waitForAdditionalElemChildrenMO(parentElement, {
          max: info.ok ? -1 : secondsToDelayAmount(60),
          pollRate: secondsToDelayAmount(2.5),
          guard() {
            const childTest =
              previousChildCount !== parentElement.childElementCount;
            if (!info.ok) return childTest;
            return !info.hasMorePosts() || childTest;
          },
        });
      },
      handler(row, additionalArgs) {
        return traverseChildrenOf(row, handlePost, additionalArgs);
      },
      setupFailure() {
        collectOutlinksFromDoc();
        autoFetchFromDoc();
        return autoScrollBehavior();
      },
      postTraversal(failure) {
        const msg = failure
          ? 'Behavior finished due to failure to find users posts container, reverting to auto scroll'
          : 'Viewed all posts of the user being viewed';
        return stateWithMsgNoWait(msg, info.state);
      },
    });
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: instagramUserBehavior({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'instagramUserBehavior',
      displayName: 'Instagram User Page',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?instagram\.com\/[^/]+(?:\/(?:[?].+)?(?:tagged(?:\/)?)?)?$/,
      },
      description:
        'Capture all stories, images, videos and comments on user’s page.',
      updated: '2019-10-11T17:08:12-04:00',
    },
  });
})(false);
