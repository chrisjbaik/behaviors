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
  function nthChildElementOf(elem, nth) {
    if (!elem || !elem.firstElementChild) return null;
    let child = elem.firstElementChild;
    for (let i = 1; i < nth; i++) {
      child = child.nextElementSibling;
      if (!child) break;
    }
    return child;
  }
  function chainQs(startingSelectFrom, startingSelector, ...selectors) {
    let selected = qs(startingSelector, startingSelectFrom);
    if (selected != null) {
      const len = selectors.length;
      for (var i = 0; i < len; ++i) {
        selected = qs(selectors[i], selected);
        if (selected == null) return null;
      }
    }
    return selected;
  }
  function getElemSibling(elem) {
    if (!elem) return null;
    return elem.nextElementSibling;
  }
  function getElemSiblingAndRemoveElem(elem) {
    const sibling = getElemSibling(elem);
    elem.remove();
    return sibling;
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
  function scrollIntoViewAndWaitFor(elem, predicate, options) {
    scrollIntoView(elem, options && options.scrollBehavior);
    return waitForPredicate(predicate, options && options.wait);
  }
  function scrollWindowBy(x, y) {
    window.scrollBy(x, y);
  }
  function scrollWindowByWithDelay(x, y, delayTime) {
    scrollWindowBy(x, y);
    return delay(delayTime || 1500);
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
  function scrollIntoViewAndClick(elem) {
    scrollIntoView(elem);
    return click(elem);
  }

  function selectAndPlay(selector, cntx) {
    const elem = qs(selector, cntx);
    return noExceptPlayMediaElement(elem);
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

  class MutationStream {
    constructor() {
      this.mo = new MutationObserver((ml, ob) => {
        if (this._resolve) {
          this._resolve(ml);
        }
      });
      this._resolve = null;
      this._loopStream = false;
    }
    observe(elem, config) {
      this.mo.observe(elem, config);
      this._loopStream = true;
    }
    observeStream(elem, config) {
      this.observe(elem, config);
      return this.streamItr();
    }
    predicatedStream(elem, config, startPredicate, stopPredicate) {
      this.observe(elem, config);
      return this.predicateStreamItr(startPredicate, stopPredicate);
    }
    disconnect() {
      this.mo.disconnect();
      this._loopStream = false;
      if (this._resolve) {
        this._resolve(null);
      }
      this._resolve = null;
    }
    _getNext() {
      return new Promise(resolve => {
        this._resolve = resolve;
      });
    }
    async *streamItr() {
      let next;
      while (this._loopStream) {
        next = await this._getNext();
        if (next == null) {
          break;
        }
        yield next;
      }
      this.disconnect();
    }
    async *predicateStreamItr(startPredicate, stopPredicate) {
      if (!startPredicate()) {
        return this.disconnect();
      }
      let checkTo;
      let next;
      while (this._loopStream) {
        next = await Promise.race([
          this._getNext(),
          new Promise(resolve => {
            checkTo = setInterval(() => {
              if (stopPredicate()) {
                checkTo = null;
                clearInterval(checkTo);
                return resolve(null);
              }
            }, 1500);
          }),
        ]);
        if (checkTo) {
          clearInterval(checkTo);
          checkTo = null;
        }
        if (next == null) break;
        yield next;
      }
      this.disconnect();
    }
    [Symbol.asyncIterator]() {
      return this.streamItr();
    }
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

  async function* traverseChildrenOfLoaderParentRemovingPrevious(
    parentElement,
    fn,
    additionalArgs
  ) {
    if (parentElement == null) return;
    for await (const child of walkChildrenOfCustom({
      parentElement,
      loader: true,
      nextChild(parent, currentChild) {
        return getElemSiblingAndRemoveElem(currentChild);
      },
    })) {
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

  const selectors = {
    videoInfoMoreId: 'more',
    loadMoreComments: '#more-replies > a > paper-button',
    showMoreReplies: 'yt-next-continuation > paper-button',
    commentRenderer: 'ytd-comment-thread-renderer',
    commentsContainerId: 'comments',
    loadedReplies: 'div[id="loaded-replies"]',
    loadingCommentsSpinner:
      '#continuations > yt-next-continuation > paper-spinner',
    outlinks: 'ytd-thumbnail > a[id="thumbnail"]',
  };
  const mutationConf = { attributes: false, childList: true, subtree: false };
  function loadMoreComments(cRenderer, selector) {
    const more = qs(selector, cRenderer);
    if (more && !more.hidden) {
      return scrollIntoViewAndClick(more);
    }
    return false;
  }
  const Reporter = {
    state: {
      loadedVideoInfo: false,
      playedVideo: false,
      viewedComments: 0,
    },
    loadedInfo() {
      this.state.loadedVideoInfo = true;
      return stateWithMsgNoWait('Loaded videos info', this.state);
    },
    playedVideo() {
      this.state.playedVideo = true;
      return stateWithMsgNoWait('Played video', this.state);
    },
    viewedComment() {
      this.state.viewedComments += 1;
      return stateWithMsgNoWait(
        `Viewing video comment #${this.state.viewedComments}`,
        this.state
      );
    },
    loadedRepliesToComment(times) {
      return stateWithMsgNoWait(
        `Loaded additional replies ${times} times to video comment #${this.state.viewedComments}`,
        this.state
      );
    },
    done() {
      return stateWithMsgNoWait('Behavior done', this.state);
    },
  };
  async function* handleComment(comment, mStream) {
    await scrollIntoViewWithDelay(comment);
    yield Reporter.viewedComment();
    const replies = qs(selectors.loadedReplies, comment);
    if (
      replies != null &&
      selectorExists(selectors.loadMoreComments, comment)
    ) {
      let totalReplies = 0;
      let next;
      const mutationIter = mStream.predicatedStream(
        replies,
        mutationConf,
        () => loadMoreComments(comment, selectors.loadMoreComments),
        () => !selectorExists(selectors.showMoreReplies, comment)
      );
      totalReplies += 1;
      next = await mutationIter.next();
      yield Reporter.loadedRepliesToComment(totalReplies);
      while (!next.done) {
        totalReplies += 1;
        await scrollIntoViewWithDelay(replies.lastChild, 750);
        if (!loadMoreComments(comment, selectors.showMoreReplies)) {
          mStream.disconnect();
          break;
        }
        next = await mutationIter.next();
        yield Reporter.loadedRepliesToComment(totalReplies);
      }
    }
  }
  async function* playVideoAndLoadComments(cliAPI) {
    await domCompletePromise();
    await scrollWindowByWithDelay(0, 500);
    const moreInfo = chainQs(
      document,
      'ytd-video-secondary-info-renderer',
      'paper-button[id="more"]'
    );
    if (moreInfo != null) {
      await scrollIntoViewAndClick(moreInfo);
      collectOutlinksFromDoc();
      yield Reporter.loadedInfo();
    }
    await selectAndPlay('video');
    yield Reporter.playedVideo();
    await scrollIntoViewAndWaitFor(id(selectors.commentsContainerId), () =>
      selectorExists(selectors.commentRenderer)
    );
    const relatedVideos = nthChildElementOf(id('related'), 2);
    if (relatedVideos) {
      addOutLinks(qsa(selectors.outlinks, relatedVideos));
    }
    autoFetchFromDoc();
    const commentsDisabled =
      xpathSnapShot(
        '//*[@id ="message" and contains(text(), "Comments are disabled for this video")]'
      ).snapshotLength === 1;
    if (!commentsDisabled) {
      const commentsContainer = qs('#comments > #sections > #contents');
      const mStream = new MutationStream();
      yield* traverseChildrenOfLoaderParentRemovingPrevious(
        commentsContainer,
        handleComment,
        mStream
      );
    }
    return Reporter.done();
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: playVideoAndLoadComments({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'youtubeVideoBehavior',
      displayName: 'Youtube',
      functional: true,
      match: {
        regex: /^(?:https?:\/\/(?:www\.)?)?youtube\.com\/watch[?]v=.+/,
      },
      description: 'Capture the YouTube video and all comments.',
      updated: '2019-08-21T14:52:23-07:00',
    },
  });
})(false);
