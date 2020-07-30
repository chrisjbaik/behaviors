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
  function selectorExists(selector, cntx) {
    return qs(selector, cntx) != null;
  }
  function attr(elem, attr) {
    if (elem) return elem.getAttribute(attr);
    return null;
  }
  function addClass(elem, clazz) {
    if (elem) {
      elem.classList.add(clazz);
    }
  }
  function hasClass(elem, clazz) {
    if (elem) return elem.classList.contains(clazz);
    return false;
  }
  function elemMatchesSelector(elem, selector) {
    if (!elem) return false;
    return elem.matches(selector);
  }
  function elementTextContains(elem, needle, caseInsensitive) {
    if (elem != null && elem.textContent != null) {
      const tc = elem.textContent;
      return (caseInsensitive ? tc.toLowerCase() : tc).includes(needle);
    }
    return false;
  }
  function elemInnerText(elem, trim) {
    if (elem != null && elem.innerText != null) {
      return trim ? elem.innerText.trim() : elem.innerText;
    }
    return null;
  }
  function innerTextOfSelected(selector, cntx) {
    return elemInnerText(qs(selector, cntx));
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
  function elemHasChildren(elem) {
    if (elem == null) return false;
    if (typeof elem.hasChildNodes === 'function') {
      return elem.hasChildNodes();
    }
    return elem.children.length > 0;
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

  function delay(delayTime) {
    return new Promise(resolve => {
      setTimeout(resolve, delayTime || 3000);
    });
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

  async function* traverseChildrenOfLoaderParent(
    parentElement,
    fn,
    additionalArgs
  ) {
    if (parentElement == null) return;
    for await (const child of walkChildrenOfCustom({
      parentElement,
      loader: true,
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
  async function* traverseChildrenOfLoaderParentGenFn(
    parentElement,
    fn,
    genFn,
    additionalArgs
  ) {
    if (parentElement == null) return;
    for await (const child of walkChildrenOfCustom({
      parentElement,
      loader: true,
      async shouldWait(parent, currentChild) {
        if (currentChild.nextElementSibling != null) return false;
        const fromGen = genFn();
        return isPromise(fromGen) ? await fromGen : fromGen;
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

  const popupAnnouncementMsg = 'span.announcement__message';
  const spotlightList = 'ul.spotlight__list';
  const userTrackStream = 'div.userStream__list > ul';
  const loadMoreTracks = 'a.compactTrackList__moreLink';
  const playSingleTrack = 'a.playButton';
  const playMultiTrackTrack = 'div.compactTrackListItem.clickToPlay';
  const playMultiTrackTrackAlt =
    'div.compactTrackListItem__content > span.compactTrackListItem__trackTitle';
  const trackList = 'ul.compactTrackList__list';
  const soundItemUser = '.soundTitle__username';
  const soundItemTitle = '.soundTitle__title';
  const compactTrackListItemTrackNumber = '.compactTrackListItem__number';
  const compactTrackListItemUser = '.compactTrackListItem__user';
  const compactTrackListItemTitle = '.compactTrackListItem__trackTitle';
  const artistActiveTab = '.g-tabs-link.active';
  const tracksAlbumsPlaylistsTrackList =
    '.userMain__content > .soundList.lazyLoadingList > .lazyLoadingList__list';
  const repostsTrackList = '.userMain__content > .userReposts > ul.soundList';

  const UserStreamItemClzz = 'userStreamItem';
  const CompactTrackListItemClzz = 'compactTrackList__item';
  const TrackItem = 'div.sound.streamContext';
  function trackTitle(soundItem, fallback) {
    if (hasClass(soundItem, CompactTrackListItemClzz)) {
      const trackNumber = (
        innerTextOfSelected(compactTrackListItemTrackNumber, soundItem) || ''
      ).trim();
      const trackUser = (
        innerTextOfSelected(compactTrackListItemUser, soundItem) || ''
      ).trim();
      const trackTitle = (
        innerTextOfSelected(compactTrackListItemTitle, soundItem) || ''
      ).trim();
      if (trackNumber && trackUser && trackTitle) {
        return `(${trackNumber}) ${trackTitle} by ${trackUser}`;
      } else if (trackNumber && trackTitle) {
        return `(${trackNumber}) ${trackTitle}`;
      } else if (trackTitle) {
        return trackTitle;
      }
    } else if (
      elemMatchesSelector(soundItem, TrackItem) ||
      hasClass(soundItem, UserStreamItemClzz)
    ) {
      let title = attr(soundItem.firstElementChild, 'aria-label');
      if (title) return title;
      title = (
        innerTextOfSelected(soundItemTitle, soundItem) || 'A track'
      ).trim();
      const user = (innerTextOfSelected(soundItemUser, soundItem) || '').trim();
      if (title && user) {
        return `${title} by ${user}`;
      }
    }
    return fallback;
  }

  let behaviorStyle;
  if (debug) {
    behaviorStyle = addBehaviorStyle(
      '.wr-debug-visited {border: 6px solid #3232F1;} .wr-debug-visited-thread-reply {border: 6px solid green;} .wr-debug-visited-overlay {border: 6px solid pink;} .wr-debug-click {border: 6px solid red;}'
    );
  }
  function needToLoadMoreTracks(elem) {
    const moreTracks = elem.querySelector(loadMoreTracks);
    if (moreTracks) return !elementTextContains(elem, 'fewer');
    return false;
  }
  const Reporter = {
    state: {
      tracksPlayed: 0,
      trackListsPlayed: 0,
    },
    playingTrack(wait, track, parentTrack) {
      this.state.tracksPlayed += 1;
      const specifics = parentTrack
        ? `"${track}" of "${parentTrack}"`
        : `"${track}"`;
      return createState(wait, `Playing ${specifics}`, this.state);
    },
    playingMultiTrack(wait, msg) {
      return createState(wait, `Playing mutli-track "${msg}"`, this.state);
    },
    playedMultiTrackList(multiTrack) {
      this.state.trackListsPlayed += 1;
      return stateWithMsgNoWait(
        `Played all tracks of "${multiTrack}"`,
        this.state
      );
    },
    done(tracksWerePlayed, place) {
      const specifics = tracksWerePlayed
        ? `every "${place}" tracks played`
        : `there were no "${place}" tracks to be played`;
      return stateWithMsgNoWait(`Behavior finished, ${specifics}`, this.state);
    },
  };
  async function handleMultipleTrackItem(playable, parentTrack) {
    markElemAsVisited(playable);
    if (debug) addClass(playable, behaviorStyle.wrDebugVisited);
    const whichTrack = trackTitle(playable, 'A track');
    let subTrackItem = playable.firstElementChild;
    let clicked;
    if (subTrackItem) {
      await scrollIntoViewWithDelay(subTrackItem);
      clicked = await clickWithDelay(subTrackItem);
    }
    if (!subTrackItem) {
      subTrackItem = qs(playMultiTrackTrack, playable);
      await scrollIntoViewWithDelay(subTrackItem);
      clicked = await clickWithDelay(subTrackItem);
    }
    if (!subTrackItem) {
      const subTrackTitle = qs(playMultiTrackTrackAlt, playable);
      await scrollIntoViewWithDelay(subTrackTitle);
      clicked = await clickWithDelay(subTrackTitle);
    }
    return Reporter.playingTrack(clicked, whichTrack, parentTrack);
  }
  async function* handleSoundItem(soundListItem) {
    collectOutlinksFrom(soundListItem);
    const soundItem = soundListItem.firstElementChild;
    if (debug) addClass(soundItem, behaviorStyle.wrDebugVisited);
    await scrollIntoViewWithDelay(soundListItem);
    const whichTrack = trackTitle(soundItem, 'A track');
    const played = await selectElemFromAndClickWithDelay(
      soundItem,
      playSingleTrack
    );
    const trackList$1 = qs(trackList, soundItem);
    if (!trackList$1) {
      yield Reporter.playingTrack(played, whichTrack);
      return;
    }
    yield Reporter.playingMultiTrack(played, whichTrack);
    if (needToLoadMoreTracks(soundItem)) {
      await selectElemFromAndClickWithDelay(soundItem, loadMoreTracks);
    }
    yield* traverseChildrenOfLoaderParentGenFn(
      trackList$1,
      handleMultipleTrackItem,
      async () => {
        const loadMore = needToLoadMoreTracks(soundItem);
        if (loadMore) {
          await selectElemFromAndClickWithDelay(soundItem, loadMoreTracks);
        }
        return loadMore;
      },
      whichTrack
    );
    yield Reporter.playedMultiTrackList(whichTrack);
  }
  async function* visitSoundItems(cliAPI) {
    if (selectorExists(popupAnnouncementMsg)) {
      const msg = qs(popupAnnouncementMsg);
      if (elementTextContains(msg, 'cookies')) {
        click(msg.nextElementSibling);
      }
    }
    let tracksWerePlayed = false;
    const tracksAlbumsPlayLists = qs(tracksAlbumsPlaylistsTrackList);
    if (elemHasChildren(tracksAlbumsPlayLists)) {
      tracksWerePlayed = true;
      yield* traverseChildrenOfLoaderParent(
        tracksAlbumsPlayLists,
        handleSoundItem
      );
    }
    const reposts = qs(repostsTrackList);
    if (elemHasChildren(reposts)) {
      tracksWerePlayed = true;
      yield* traverseChildrenOfLoaderParent(reposts, handleSoundItem);
    }
    const spotLightList = qs(spotlightList);
    if (elemHasChildren(spotLightList)) {
      tracksWerePlayed = true;
      yield* traverseChildrenOf(spotLightList, handleSoundItem);
    }
    const userStream = qs(userTrackStream);
    if (elemHasChildren(userStream)) {
      tracksWerePlayed = true;
      yield* traverseChildrenOfLoaderParent(userStream, handleSoundItem);
    }
    return Reporter.done(
      tracksWerePlayed,
      (innerTextOfSelected(artistActiveTab) || '').trim()
    );
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: visitSoundItems({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'soundCloudArtistBehavior',
      displayName: 'Soundcloud Profile',
      functional: true,
      match: {
        regex: /^(?:https?:\/\/(?:www\.)?)?soundcloud\.com\/(?!(?:discover|stream))[^/]+(?:\/(?:tracks|albums|sets|reposts))?(?:\/)?$/,
      },
      description: 'Capture every track on Soundcloud profile.',
      updated: '2019-08-21T14:52:23-07:00',
    },
  });
})(false);
