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
  const postMain = 'section > main > div > div > article';
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

  function getPostMain() {
    let maybeArticle = qs(postMain);
    if (!elementsNameEquals(maybeArticle, 'article')) {
      maybeArticle = chainFistChildElemOf(document.body, 6);
    }
    if (!elementsNameEquals(maybeArticle, 'article')) {
      return null;
    }
    return maybeArticle;
  }
  async function* instagramPostBehavior(cliAPI) {
    collectOutlinksFromDoc();
    const postMain = getPostMain();
    const info = {
      state: {
        total: 0,
        viewed: 0,
        viewedFully: 0,
      },
    };
    if (postMain == null) {
      return stateWithMsgNoWait('There was no post', info.state);
    }
    info.state.total = 1;
    info.state.viewed = 1;
    const postId$1 = postId(location);
    let result;
    try {
      result = await handlePostContent({
        thePost: postMain,
        content: postMain,
        viewing: ViewingSinglePost,
        info,
        postId: postId$1,
      });
    } catch (e) {
      result = stateWithMsgNoWait(
        `An error occurred while viewing the contents of ${postId$1}`,
        info.state
      );
    }
    yield result;
    const commentList = qs('ul', postMain);
    if (commentList) {
      yield* viewComments({
        commentList,
        info,
        postId: postId$1,
        $x: cliAPI.$x,
      });
    }
    info.state.viewedFully = 1;
    return stateWithMsgNoWait(`Viewed ${postId$1}`, info.state);
  }

  initRunnableBehavior({
    win: window,
    behaviorStepIterator: instagramPostBehavior({
      $x: maybePolyfillXPG(window.$x),
      getEventListeners: window.getEventListeners,
    }),
    metadata: {
      name: 'instagramPostBehavior',
      displayName: 'Instagram Post',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?instagram\.com\/p\/[^/]+(?:\/)?$/,
      },
      description:
        'Capture every image and/or video, retrieve all comments, and scroll down to load more.',
      updated: '2019-10-11T17:08:12-04:00',
    },
  });
})(false);
