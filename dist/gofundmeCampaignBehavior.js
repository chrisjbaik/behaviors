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

  const RATE_LIMIT_DELAY = 1000;
  const PAGE_SCROLL_INCREMENT = 300;
  const PAGE_SCROLL_DELAY = 100;
  const updatesShowOlderSelector =
    '#root > div > main > div > div.p-campaign-content > div.p-campaign-updates > div > button';
  const commentsShowMoreSelector =
    '#root > div > main > div > div.p-campaign-content > div.p-campaign-comments > div > button';
  const donationsButtonSelector =
    '#root > div > main > div > div.p-campaign-sidebar > aside > div.show-for-large > div > div > a.mt.a-button.a-button--inline.a-button--small.a-button--hollow-green.a-link';
  const donationModalContent = '.o-modal-donations-content';
  const donationsSelector = '.o-donation-list-item';
  const commentsSelector = 'li.o-comments-list-item';
  function getCampaignId() {
    const regex = /\/f\/([^\/]*)/;
    const match = window.location.pathname.match(regex);
    if (match) {
      return match[1];
    } else {
      return '';
    }
  }
  async function* gofundmeCampaignBehavior(cliAPI) {
    await domCompletePromise();
    const state = {
      timesScrolled: 0,
      commentsLoaded: 0,
      updateBatchesLoaded: 0,
      donationsLoaded: 0,
    };
    const scroller = createScroller();
    scroller.scrollUpDownAmount = PAGE_SCROLL_INCREMENT;
    while (scroller.canScrollDownMore()) {
      scroller.scrollDown();
      state.timesScrolled++;
      await delay(PAGE_SCROLL_DELAY);
      yield stateWithMsgWait('Autoscroll waiting for network idle', state);
    }
    yield stateWithMsgWait('Waiting for updates to load...', state);
    let showOlderButton = qs(updatesShowOlderSelector);
    while (showOlderButton) {
      await clickWithDelay(showOlderButton, RATE_LIMIT_DELAY);
      state.updateBatchesLoaded += 1;
      yield stateWithMsgWait('Waiting for more updates to load...', state);
      showOlderButton = qs(updatesShowOlderSelector);
    }
    let showMoreButton = qs(commentsShowMoreSelector);
    let moreToExtract = true;
    let lastCommentCount = 0;
    while (moreToExtract) {
      await clickWithDelay(showMoreButton, RATE_LIMIT_DELAY);
      yield stateWithMsgWait('Waiting for more comments to load...', state);
      const commentNodes = qsa(commentsSelector);
      if (commentNodes) {
        state.commentsLoaded = commentNodes.length;
      }
      if (!commentNodes || commentNodes.length === lastCommentCount) {
        moreToExtract = false;
      }
      lastCommentCount = commentNodes.length;
    }
    let donationsButton = qs(donationsButtonSelector);
    if (donationsButton) {
      await clickWithDelay(donationsButton, RATE_LIMIT_DELAY);
      yield stateWithMsgWait('Loading donations...', state);
      const donationsModal = qs(donationModalContent);
      let donations = qsa(donationsSelector);
      let lastDonationCount = (donations && donations.length) || 0;
      let moreDonations = true;
      while (moreDonations) {
        donationsModal.scroll(0, donationsModal.scrollHeight);
        await delay(RATE_LIMIT_DELAY);
        yield stateWithMsgWait('Waiting for more donations to load...', state);
        donations = qsa(donationsSelector);
        if (donations) {
          state.donationsLoaded = donations.length;
        }
        if (!donations || donations.length === lastDonationCount) {
          moreDonations = false;
        }
        lastDonationCount = donations.length;
      }
    }
    return stateWithMsgNoWait(
      `Finished viewing Campaign <${getCampaignId()}>`,
      state
    );
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: gofundmeCampaignBehavior({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'gofundmeCampaignBehavior',
      displayName: 'GoFundMe Campaign',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?gofundme\.com\/f\/[^/]+(?:\/)?$/,
      },
      description: 'Capture and expand all updates, comments, and donations.',
    },
  });
})(false);
