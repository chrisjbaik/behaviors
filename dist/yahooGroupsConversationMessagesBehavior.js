(function runner(debug) {
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
  function isFunction(obj) {
    return typeof obj === 'function';
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
  function attr(elem, attr) {
    if (elem) return elem.getAttribute(attr);
    return null;
  }
  function firstChildElementOf(elem) {
    if (elem != null) return elem.firstElementChild;
    return null;
  }
  function elemMatchesSelector(elem, selector) {
    if (!elem) return false;
    return elem.matches(selector);
  }
  function isElemVisible(elem) {
    if (elem == null) return false;
    const computedStyle = window.getComputedStyle(elem);
    if (computedStyle.display === 'none') return false;
    return computedStyle.visibility === 'visible';
  }
  function getNthParentElement(elem, nth) {
    if (elem != null && elem.parentElement != null && nth >= 1) {
      let counter = nth - 1;
      let parent = elem.parentElement;
      while (counter > 0 && parent != null) {
        parent = parent.parentElement;
        counter--;
      }
      return parent;
    }
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
  async function loadPageViaIframe(pageURL) {
    const iframe = document.createElement('iframe');
    iframe.src = pageURL;
    iframe.setAttribute(
      'style',
      `width: 100vw; 
height: 100vh;
opacity: 0;
visibility: hidden;
`
    );
    const loadProm = waitForEventTargetToFireEvent(iframe, 'load');
    document.body.appendChild(iframe);
    await loadProm;
    iframe.remove();
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
  function waitForElementToBecomeInvisible(elem, options) {
    const results = { predicate: false, maxExceeded: false };
    const opts = Object.assign({ pollRate: 1000, max: 15050 }, options);
    return new Promise(resolve => {
      if (!isElemVisible(elem)) {
        results.predicate = true;
        return resolve(results);
      }
      let safety;
      const poll = setInterval(() => {
        if (!isElemVisible(elem)) {
          if (safety) clearTimeout(safety);
          clearInterval(poll);
          results.predicate = true;
          return resolve(results);
        }
      }, opts.pollRate);
      if (opts.max !== -1) {
        safety = setTimeout(() => {
          clearInterval(poll);
          results.predicate = !isElemVisible(elem);
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
  function selectElemAndClickWithDelay(selector, delayTime) {
    return clickWithDelay(document.querySelector(selector), delayTime || 1000);
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

  const WalkEndedReasons = {
    failedToFindFirstParent: 1,
    failedToFindFirstChild: 2,
    failedToRefindParent: 3,
    failedToRefindChild: 4,
    noMoreChildren: 0,
  };
  class DisconnectingWalk {
    constructor(config) {
      config.loader = !!config.loader;
      if (
        !config.loader &&
        (isFunction(config.shouldWait) || isFunction(config.wait))
      ) {
        config.loader = true;
      }
      if (config.loader && !isFunction(config.shouldWait)) {
        config.shouldWait = (parent, child) => child.nextElementSibling == null;
      }
      if (config.loader && !isFunction(config.wait)) {
        config.wait = (parent, child) =>
          waitForAdditionalElemChildren(parent, config.waitOptions);
      }
      if (!isFunction(config.nextChild)) {
        config.nextChild = (parent, child) => child.nextElementSibling;
      }
      this.opts = config;
      this.walkEndedReason = null;
      const parent = this.opts.findParent();
      let child;
      if (!parent) {
        this.walkEndedReason = WalkEndedReasons.failedToFindFirstParent;
      } else {
        child = parent.firstElementChild;
        if (!child) {
          this.walkEndedReason = WalkEndedReasons.failedToFindFirstChild;
        }
      }
      this._curParent = parent;
      this._curChild = child;
      autobind(this);
    }
    get parent() {
      return this._curParent;
    }
    get child() {
      return this._curChild;
    }
    swapChild(newChild) {
      this._curChild = newChild;
    }
    refind() {
      if (!this._curParent || !this._curParent.isConnected) {
        this._curParent = this.opts.findParent();
        if (!this._curParent) {
          this.walkEndedReason = WalkEndedReasons.failedToRefindParent;
          return false;
        }
        this._curChild = this.opts.refindChild(this._curParent, this._curChild);
        if (!this._curChild) {
          this.walkEndedReason = WalkEndedReasons.failedToRefindChild;
          return false;
        }
      }
      if (!this._curChild || !this._curChild.isConnected) {
        this._curChild = this.opts.refindChild(this._curParent, this._curChild);
        if (!this._curChild) {
          this.walkEndedReason = WalkEndedReasons.failedToRefindChild;
          return false;
        }
      }
      return true;
    }
    async *walk() {
      if (this.walkEndedReason) return;
      while (this._curChild != null && this._curChild.isConnected) {
        yield this._curChild;
        if (!this.refind()) break;
        if (
          this.opts.loader &&
          this.opts.shouldWait(this._curParent, this._curChild)
        ) {
          await this.opts.wait(this._curParent, this._curChild);
        }
        this._curChild = this.opts.nextChild(this._curParent, this._curChild);
      }
      if (!this.walkEndedReason) {
        this.walkEndedReason = WalkEndedReasons.noMoreChildren;
      }
    }
    [Symbol.asyncIterator]() {
      return this.walk();
    }
  }

  const MessageListGrid = 'div[role="grid"].yg-list-grid';
  const MessageIdContainer = '.yg-msglist-id';
  const MessageRow = 'div.y-col.yg-msg-row[role="row"]';
  const ViewMessageTitle = 'div.yg-msglist-title[role="gridcell"]';
  const ViewingMessageBack =
    'a[role="presentation"][href*="/conversations/messages"]';
  const BaseRefindMessage = `${MessageRow} > ${ViewMessageTitle} > h3`;
  const MessageAttachments = 'ul.attachment-ul';
  const CloseViewedMessageAttachment =
    'button.yui3-button-close[type="button"]';
  const MessageAttachmentImage = 'a.photo-attachment-viewer';
  const MessageAttachmentImageViewerId = 'file-image-area';
  const AnnoyingUpsellContainerId = 'yset-search-upsell-container';
  const PageLoader = '.page-loader';
  const ExtraComboUrls = [
    'https://s.yimg.com/zz/combo?/ru/0.9.17/min/js/yg-message-attachments.js&/ru/0.9.17/min/js/yg-plugin-swipe-page.js&/ru/0.9.17/min/js/yg-inline-video-player.js&/ru/0.9.17/min/js/yg-msg-read.js&yui:3.15.0/querystring-parse/querystring-parse-min.js',
    'https://s.yimg.com/zz/combo?/ru/0.9.17/min/js/yg-rte-new.js&yui:3.15.0/file-html5/file-html5-min.js&yui:3.15.0/uploader-queue/uploader-queue-min.js&yui:3.15.0/uploader-html5/uploader-html5-min.js&yui:3.15.0/swfdetect/swfdetect-min.js&yui:3.15.0/uploader-flash/uploader-flash-min.js&yui:3.15.0/uploader/uploader-min.js&/ru/0.9.17/min/js/yg-message-poll.js&/ru/0.9.17/min/js/yg-conversations-common.js',
  ];

  function messageInfo(messageRow) {
    const messageTitle = qs(ViewMessageTitle, messageRow);
    const view = qs('a', messageTitle);
    const refindSelector = `${BaseRefindMessage} > a[href*="${attr(
      view,
      'href'
    )}"]`;
    const title = attr(view, 'title');
    const msgId = (
      innerTextOfSelected(MessageIdContainer, messageRow) || ''
    ).trim();
    return {
      refind(parentElem) {
        const newView = qs(refindSelector, parentElem);
        return getNthParentElement(newView, 3);
      },
      whichMsg: msgId ? `${title} (${msgId})` : title,
      view,
    };
  }
  function attachmentImgIsLoading() {
    const img = id(MessageAttachmentImageViewerId);
    const computedStyle = window.getComputedStyle(img);
    return (
      computedStyle.background.includes('cover-loader.gif') || !img.complete
    );
  }
  function isAttachmentImage(attachment) {
    return elemMatchesSelector(
      firstChildElementOf(attachment),
      MessageAttachmentImage
    );
  }
  function ensureNoAnnoyingElements() {
    maybeRemoveElemById(AnnoyingUpsellContainerId);
  }
  const attachmentImgIsNoLongerLoading = () => !attachmentImgIsLoading();
  const isImageViewerVisible = () =>
    isElemVisible(qs(CloseViewedMessageAttachment));
  const MaxPredicateWait = {
    max: secondsToDelayAmount(6),
  };
  async function clickAndCheckLoading(toBeClicked) {
    await clickWithDelay(toBeClicked);
    const pageLoadingIndicator = qs(PageLoader);
    if (isElemVisible(pageLoadingIndicator)) {
      await waitForElementToBecomeInvisible(pageLoadingIndicator);
    }
  }
  async function* yahooGroupConvoMessagesBehavior() {
    const state = { messages: 0 };
    await domCompletePromise();
    ensureNoAnnoyingElements();
    let childRefinder;
    const walker = new DisconnectingWalk({
      loader: true,
      findParent: () => qs(MessageListGrid),
      refindChild: (parent, child) => childRefinder(parent),
      wait: (parent, child) => waitForAdditionalElemChildren(parent),
    });
    for await (const messageRow of walker.walk()) {
      if (!elemMatchesSelector(messageRow, MessageRow)) {
        continue;
      }
      const { view, refind, whichMsg } = messageInfo(messageRow);
      if (state.messages === 0) {
        yield stateWithMsgNoWait(
          'Ensuring messages can be viewed individually',
          state
        );
        sendAutoFetchWorkerURLs(ExtraComboUrls);
        await loadPageViaIframe(view.href);
      }
      childRefinder = refind;
      state.messages++;
      await scrollIntoViewWithDelay(messageRow);
      yield stateWithMsgNoWait(`Viewing message - ${whichMsg}`, state);
      await clickAndCheckLoading(view);
      const attachments = qs(MessageAttachments);
      collectOutlinksFromDoc();
      if (elemHasChildren(attachments)) {
        yield stateWithMsgNoWait(
          "Viewing message's image attachments if any",
          state
        );
        for (const attachment of childElementIterator(attachments)) {
          const viewAttachment = qs('a', attachment);
          if (isAttachmentImage(attachment)) {
            yield stateWithMsgNoWait('Viewing image attachment', state);
            await clickWithDelay(viewAttachment);
            await waitForPredicate(isImageViewerVisible, MaxPredicateWait);
            if (attachmentImgIsLoading()) {
              yield stateWithMsgNoWait(
                'Waiting for current attachment image to load',
                state
              );
              await waitForPredicate(
                attachmentImgIsNoLongerLoading,
                MaxPredicateWait
              );
            }
          } else {
            yield stateWithMsgNoWait('Encountered non-image attachment', state);
            sendAutoFetchWorkerURLs([viewAttachment.href]);
          }
          await selectElemAndClickWithDelay(CloseViewedMessageAttachment);
        }
      }
      yield stateWithMsgNoWait(
        'Ensuring next previous message buttons work for current message',
        state
      );
      await clickAndCheckLoading(qs(ViewingMessageBack));
      yield stateWithMsgNoWait(`Viewed message - ${whichMsg}`, state);
    }
    switch (walker.walkEndedReason) {
      case WalkEndedReasons.failedToFindFirstParent:
        return stateWithMsgNoWait(
          'Failed to find messages root element',
          state
        );
      case WalkEndedReasons.failedToRefindParent:
        return stateWithMsgNoWait(
          'Failed to re-find messages root element',
          state
        );
      case WalkEndedReasons.failedToFindFirstChild:
        return stateWithMsgNoWait('Failed to find a message', state);
      case WalkEndedReasons.failedToRefindChild:
        return stateWithMsgNoWait(
          'Failed to re-find previously viewed message',
          state
        );
      case WalkEndedReasons.noMoreChildren:
        return stateWithMsgNoWait('done', state);
    }
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: yahooGroupConvoMessagesBehavior({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'yahooGroupConvoMessagesBehavior',
      displayName: 'Yahoo Group Conversation Messages',
      functional: true,
      match: {
        regex: /^https?:\/\/(?:www\.)?groups\.yahoo\.com\/neo\/groups\/[^/]+\/conversations\/messages(?:[?].+)?$/,
      },
      description: 'Views conversation messages of a Yahoo Group',
      updated: '2019-10-23T15:04:10-04:00',
    },
  });
})(false);
