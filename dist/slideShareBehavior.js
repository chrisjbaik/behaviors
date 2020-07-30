(function runner(debug) {
  function autoFetchFromDoc() {
    if (window.$WBAutoFetchWorker$) {
      window.$WBAutoFetchWorker$.extractFromLocalDoc();
    }
  }
  function sendAutoFetchWorkerURLs(urls) {
    if (window.$WBAutoFetchWorker$) {
      window.$WBAutoFetchWorker$.justFetch(urls);
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
  function canAccessIf(iframe) {
    if (iframe == null) return false;
    try {
      iframe.contentWindow.window;
    } catch (e) {
      return false;
    }
    return iframe.contentDocument != null;
  }
  function selectorExists(selector, cntx) {
    return qs(selector, cntx) != null;
  }
  function findTag(xpg, tag, predicate, cntx) {
    const tags = xpg(`//${tag}`, cntx || document);
    for (var i = 0; i < tags.length; ++i) {
      if (predicate(tags[i])) return tags[i];
    }
    return null;
  }
  function attr(elem, attr) {
    if (elem) return elem.getAttribute(attr);
    return null;
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
  function waitForEventTargetToFireEvent(eventTarget, event, max) {
    const promResolveReject = promiseResolveReject();
    const listener = fromSafety => {
      eventTarget.removeEventListener(event, listener);
      promResolveReject.resolve(!fromSafety);
    };
    eventTarget.addEventListener(event, listener);
    if (max) {
      setTimeout(listener, max, true);
    }
    return promResolveReject.promise;
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

  const __clickPreEvents = ['mousemove', 'mouseover', 'mousedown', 'mouseup'];
  function clickInContext(elem, cntx) {
    let clicked = false;
    if (elem != null) {
      fireMouseEventsOnElement({
        elem,
        eventNames: __clickPreEvents,
        view: cntx,
      });
      elem.click();
      elem.dispatchEvent(
        createMouseEvent({ type: 'mouseleave', view: cntx, elem })
      );
      clicked = true;
    }
    return clicked;
  }
  async function clickInContextWithDelay(elem, cntx, delayTime) {
    const clicked = clickInContext(elem, cntx);
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
  function addOutlink(elemOrString) {
    if (window.$WBNOOUTLINKS) {
      return;
    }
    if (!didInit) initOutlinkCollection();
    const href = (elemOrString.href || elemOrString).trim();
    if (href && !__outlinksSet__.has(href) && !shouldIgnoreLink(href)) {
      __outlinksSet__.add(href);
    }
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

  const selectors = {
    iframeLoader: 'iframe.ssIframeLoader',
    nextSlide: 'btnNext',
    slideContainer: 'div.slide_container',
    showingSlide: '.slide.show',
    divSlide: 'div.slide',
    sectionSlide: 'section.slide',
    slideImg: 'img.slide_image',
    relatedDecks: 'div.tab.related-tab',
    moreComments: 'a.j-more-comments',
    deckTitle: '.slideshowMetaData > a[title]',
    currentSlideNum: 'span#current-slide',
    totalSlidesNum: 'span#total-slide',
  };
  const isSlideShelfIF = _if => _if.src.endsWith('/slideshelf');
  const Reporter = {
    state: {
      slides: 0,
      decks: 0,
    },
    viewingSlideDeck(deckTitle, numSlides) {
      this.state.slides += 1;
      const specifics = deckTitle
        ? `"${deckTitle}"`
        : `#${this.state.decks + 1}`;
      return stateWithMsgNoWait(
        `Viewing slide deck ${specifics} with #${numSlides} slides`,
        this.state
      );
    },
    viewedSlideDeck(deckTitle, numSlides) {
      const specifics = deckTitle
        ? `"${deckTitle}"`
        : `#${this.state.decks + 1}`;
      this.state.decks += 1;
      return stateWithMsgNoWait(
        `Viewed slide deck ${specifics} that had #${numSlides} slides`,
        this.state
      );
    },
    viewedSlide(deckTitle, totalSlides, slideN) {
      const specifics = deckTitle
        ? `"${deckTitle}"`
        : `#${this.state.decks + 1}`;
      this.state.slides += 1;
      return stateWithMsgNoWait(
        `Viewing slide ${slideN} of ${totalSlides} from deck ${specifics}`,
        this.state
      );
    },
    done() {
      return stateWithMsgNoWait(
        'Behavior done: Viewed all slide deck(s)',
        this.state
      );
    },
  };
  function extracAndPreserveSlideImgs(doc) {
    const imgs = qsa(selectors.slideImg, doc);
    const len = imgs.length;
    const toFetch = [];
    let imgDset;
    for (let i = 0; i < len; ++i) {
      imgDset = imgs[i].dataset;
      if (imgDset) {
        toFetch.push(imgDset.full);
        toFetch.push(imgDset.normal);
        toFetch.push(imgDset.small);
      }
    }
    sendAutoFetchWorkerURLs(toFetch);
  }
  function totalNumberOfSlides(doc, slideSelector) {
    const totalSlidesText = (
      innerTextOfSelected(selectors.totalSlidesNum, doc) || ''
    ).trim();
    if (totalSlidesText) {
      const totalSlides = Number(totalSlidesText);
      if (!isNaN(totalSlides)) return totalSlides;
    }
    const slideContainer = qs(selectors.slideContainer, doc);
    if (slideContainer) {
      return qsa(slideSelector, doc).length;
    }
    return -1;
  }
  function startingSlideNumber(doc) {
    let startingSlideText = (
      innerTextOfSelected(selectors.currentSlideNum, doc) ||
      innerTextOfSelected(selectors.showingSlide, doc) ||
      ''
    ).trim();
    if (startingSlideText) {
      const startingSlideNum = Number(startingSlideText);
      if (!isNaN(startingSlideNum)) return startingSlideNum;
    }
    return 1;
  }
  async function* consumeSlides(win, doc, slideSelector, deckTitle) {
    const numSlides = totalNumberOfSlides(doc, slideSelector);
    yield Reporter.viewingSlideDeck(deckTitle, numSlides);
    extracAndPreserveSlideImgs(doc);
    for (var i = startingSlideNumber(doc); i < numSlides; ++i) {
      await clickInContextWithDelay(id(selectors.nextSlide, doc), win, 500);
      yield Reporter.viewedSlide(deckTitle, numSlides, i + 1);
    }
    yield Reporter.viewedSlideDeck(deckTitle, numSlides);
  }
  async function* handleSlideDeck() {
    await domCompletePromise();
    collectOutlinksFromDoc();
    yield* consumeSlides(
      window,
      document,
      selectors.sectionSlide,
      (innerTextOfSelected('.slideshow-title-text') || '').trim()
    );
    collectOutlinksFromDoc();
    return Reporter.done();
  }
  async function* doSlideShowInFrame(win, doc) {
    await domCompletePromise();
    const decks = qsa('li', qs(selectors.relatedDecks, doc));
    const numDecks = decks.length;
    const deckIF = qs(selectors.iframeLoader, doc);
    yield* consumeSlides(
      deckIF.contentWindow,
      deckIF.contentDocument,
      selectors.divSlide,
      attr(qs(selectors.deckTitle, doc), 'title')
    );
    for (var i = 1; i < numDecks; ++i) {
      addOutlink(decks[i].firstElementChild);
      await Promise.all([
        clickInContextWithDelay(decks[i].firstElementChild, win),
        waitForEventTargetToFireEvent(deckIF, 'load'),
      ]);
      yield* consumeSlides(
        deckIF.contentWindow,
        deckIF.contentDocument,
        selectors.divSlide,
        attr(qs(selectors.deckTitle, doc), 'title')
      );
    }
    return Reporter.done();
  }
  function init(cliAPI) {
    if (canAccessIf(qs(selectors.iframeLoader))) {
      return doSlideShowInFrame(window, document);
    }
    const maybeIF = findTag(cliAPI.$x, 'iframe', isSlideShelfIF);
    if (maybeIF && canAccessIf(maybeIF)) {
      return doSlideShowInFrame(maybeIF.contentWindow, maybeIF.contentDocument);
    }
    if (selectorExists(selectors.sectionSlide, document)) {
      return handleSlideDeck();
    }
    return autoScrollBehavior({
      fallbackMsg:
        'There were not slide decks to be viewed, falling back to auto scroll',
    });
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: init({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'slideShareBehavior',
      displayName: 'SlideShare',
      functional: true,
      match: {
        regex: /^(?:https?:\/\/(?:www\.)?)slideshare\.net\/.+/,
      },
      description:
        'Capture each slide contained in the slide deck. If there are multiple slide decks, view and capture each deck.',
      updated: '2019-08-21T14:52:23-07:00',
    },
  });
})(false);
