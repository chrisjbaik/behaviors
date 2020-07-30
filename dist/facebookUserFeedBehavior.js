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
  function buildCustomPostStepFn(customFN) {
    return function wrappedPostStep(state) {
      customFN(state);
      return doneOrWait(state);
    };
  }

  const __camelCaseRe = /(-|_|\s)+(.)?/g;
  const __camelCaseReplacer = (match, sep, c) => (c ? c.toUpperCase() : '');
  function camelCase(str) {
    return str.replace(__camelCaseRe, __camelCaseReplacer);
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
  function* repeatedQSAIterator(selector, context) {
    let results = qsa(selector, context);
    while (results.length) {
      for (let i = 0; i < results.length; i++) {
        yield results[i];
      }
      results = qsa(selector, context);
    }
  }
  function id(eid, context) {
    if (context != null) return context.getElementById(eid);
    return document.getElementById(eid);
  }
  function maybeRemoveElemById(eid, context) {
    const elem = id(eid, context);
    if (elem) {
      elem.remove();
      return true;
    }
    return false;
  }
  function markElemAsVisited(elem, marker = 'wrvistited') {
    if (elem != null) {
      elem.classList.add(marker);
    }
  }
  function addBehaviorStyle(styleDef) {
    let style = document.getElementById('$wrStyle$');
    if (style == null) {
      style = document.createElement('style');
      style.id = '$wrStyle$';
      document.head.appendChild(style);
    }
    style.textContent = styleDef;
    const rules = style.sheet.rules;
    let ruleIdx = rules.length;
    let selector;
    const classes = {};
    while (ruleIdx--) {
      selector = rules[ruleIdx].selectorText.replace('.', '');
      classes[camelCase(selector)] = selector;
    }
    return classes;
  }
  function hasClass(elem, clazz) {
    if (elem) return elem.classList.contains(clazz);
    return false;
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

  const DelayAmount1Second = 1000;
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
  function waitUntilElementIsRemovedFromDom(elem, options) {
    const results = { predicate: false, maxExceeded: false };
    const opts = Object.assign({ pollRate: 1000, max: 15000 }, options);
    return new Promise(resolve => {
      if (!elem.isConnected) {
        results.predicate = true;
        return resolve(results);
      }
      let safety;
      const poll = setInterval(() => {
        if (!elem.isConnected) {
          if (safety) clearTimeout(safety);
          clearInterval(poll);
          results.predicate = true;
          return resolve(results);
        }
      }, opts.pollRate);
      if (opts.max !== -1) {
        safety = setTimeout(() => {
          clearInterval(poll);
          results.predicate = !elem.isConnected;
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
  function createState(wait, msg, state = {}) {
    return { wait, msg, state };
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
  function selectElemFromAndClickWithDelay(selectFrom, selector, delayTime) {
    return clickWithDelay(qs(selector, selectFrom), delayTime || 1000);
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
  function collectOutlinksFrom(queryFrom) {
    if (window.$WBNOOUTLINKS) {
      return;
    }
    if (!didInit) initOutlinkCollection();
    addOutLinks(queryFrom.querySelectorAll(outlinkSelector));
  }

  const PageletGrowthId = 'pagelet_growth_expanding_cta';
  const UserTimelineItemXPath =
    '//div[contains(@class, "userContentWrapper") and not(contains(@class, "wrvistited"))]';
  const TheaterItem = 'a[rel="theater"]';
  const TheaterId = 'photos_snowlift';
  const TheaterSelector =
    'div[aria-label="Facebook Photo Theater"][role="dialog"]';
  const CloseTheater = 'a[href="#"]';
  const PlayVideoSelector = 'i > input[aria-label="Play video"]';
  const MoreCommentsSelector =
    'a[data-testid*="CommentsPagerRenderer/pager_depth"]';
  const UserFeedMore = '.clearfix.uiMorePager';

  const MAX_WAIT = { max: 10000 };
  const THEATER_READY_CLASS = 'pagingReady';
  const FindTheaterPredicate = () => findTheater() != null;
  function findTheater() {
    const theater = qs(TheaterSelector);
    if (theater) return theater;
    return id(TheaterId);
  }
  async function maybeViewPostOrImageInTheater(timelineItem) {
    const theaterItems = qsa(TheaterItem, timelineItem);
    if (!theaterItems.length) return;
    let theater = findTheater();
    for (let i = 0; i < theaterItems.length; i++) {
      await clickWithDelay(theaterItems[i]);
      if (!theater) {
        await waitForPredicate(FindTheaterPredicate, MAX_WAIT);
        theater = findTheater();
        if (!theater) return;
      }
      if (!hasClass(theater, THEATER_READY_CLASS)) {
        await waitForPredicate(
          () => hasClass(theater, THEATER_READY_CLASS),
          MAX_WAIT
        );
      }
      await delay(DelayAmount1Second);
      await selectElemFromAndClickWithDelay(theater, CloseTheater);
    }
  }

  let behaviorStyle;
  if (debug) {
    behaviorStyle = addBehaviorStyle(
      '.wr-debug-visited {border: 6px solid #3232F1;}'
    );
  }
  const delayTime = 1500;
  let removedAnnoying = maybeRemoveElemById(PageletGrowthId);
  async function* walkUserTimeline() {
    let items = xpathSnapShot(UserTimelineItemXPath);
    while (items.snapshotLength) {
      for (let i = 0; i < items.snapshotLength; ++i) {
        yield items.snapshotItem(i);
      }
      items = xpathSnapShot(UserTimelineItemXPath);
      if (items.snapshotLength === 0) {
        const feedPlaceHolder = qs(UserFeedMore);
        if (feedPlaceHolder && feedPlaceHolder.isConnected) {
          scrollIntoView(feedPlaceHolder);
          await waitUntilElementIsRemovedFromDom(feedPlaceHolder);
        } else {
          await delay();
        }
        items = xpathSnapShot(UserTimelineItemXPath);
      }
    }
  }
  async function* initFBUserFeedBehaviorIterator(cliAPI) {
    const state = { videos: 0, posts: 0 };
    for await (const timelineItem of walkUserTimeline()) {
      state.posts++;
      await scrollIntoViewWithDelay(timelineItem, delayTime);
      markElemAsVisited(timelineItem);
      collectOutlinksFrom(timelineItem);
      const playVideo = qs(PlayVideoSelector, timelineItem);
      let wait = false;
      if (playVideo) {
        wait = true;
        state.videos++;
        await clickWithDelay(playVideo);
      }
      await maybeViewPostOrImageInTheater(timelineItem);
      let moreCommentsLoaded = 0;
      for (const loadMoreComments of repeatedQSAIterator(
        MoreCommentsSelector,
        timelineItem
      )) {
        await scrollIntoViewAndClickWithDelay(loadMoreComments);
        yield stateWithMsgWait(
          `Loaded more comments ${++moreCommentsLoaded} time for feed item ${
            state.posts
          }`,
          state
        );
      }
      yield createState(wait, `Viewed feed item ${state.posts}`, state);
    }
    return stateWithMsgNoWait('Behavior done', state);
  }
  const postStep = buildCustomPostStepFn(() => {
    if (!removedAnnoying) {
      removedAnnoying = maybeRemoveElemById(PageletGrowthId);
    }
  });

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: initFBUserFeedBehaviorIterator({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    postStepFN: postStep,
    metadata: {
      name: 'facebookUserFeed',
      displayName: 'Facebook Page',
      match: {
        regex: /^https?:\/\/(www\.)?facebook\.com\/[^/]+\/?$/,
      },
      description:
        'Capture all items and comments in the Facebook page and scroll down to load more content where possible.',
      updated: '2019-08-21T14:52:23-07:00',
    },
  });
})(false);
