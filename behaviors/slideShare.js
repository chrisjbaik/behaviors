import * as lib from '../lib';

let totalSlideDecks = 0;

const selectors = {
  iframeLoader: 'iframe.ssIframeLoader',
  nextSlide: 'btnNext',
  slideContainer: 'div.slide_container',
  showingSlide: 'div.slide.show',
  divSlide: 'div.slide',
  sectionSlide: 'section.slide',
  slideImg: 'img.slide_image',
  relatedDecks: 'div.tab.related-tab',
  moreComments: 'a.j-more-comments',
};

const isSlideShelfIF = _if => _if.src.endsWith('/slideshelf');

/**
 * @param {Document | Element} doc
 * @param {string} slideSelector
 * @return {number}
 */
function getNumSlides(doc, slideSelector) {
  const slideContainer = lib.qs(selectors.slideContainer, doc);
  if (slideContainer) {
    return lib.qsa(slideSelector, doc).length;
  }
  return -1;
}

/**
 * @param {Document} doc
 */
function extracAndPreserveSlideImgs(doc) {
  const imgs = lib.qsa(selectors.slideImg, doc);
  const len = imgs.length;
  const toFetch = [];
  let i = 0;
  let imgDset;
  for (; i < len; ++i) {
    imgDset = imgs[i].dataset;
    if (imgDset) {
      toFetch.push(imgDset.full);
      toFetch.push(imgDset.normal);
      toFetch.push(imgDset.small);
    }
  }
  lib.sendAutoFetchWorkerURLs(toFetch);
}

/**
 * @param {Window} win
 * @param {Document} doc
 * @param {string} slideSelector
 * @return {AsyncIterableIterator<*>}
 */
async function* consumeSlides(win, doc, slideSelector) {
  totalSlideDecks += 1;
  yield lib.stateWithMsgNoWait(`Viewing slide deck #${totalSlideDecks}`);
  extracAndPreserveSlideImgs(doc);
  const numSlides = getNumSlides(doc, slideSelector);
  for (var i = 0; i < numSlides; ++i) {
    await lib.clickInContextWithDelay(
      lib.id(selectors.nextSlide, doc),
      win,
      500
    );
    yield lib.stateWithMsgNoWait(
      `Viewed slide #${i + 1} of deck #${totalSlideDecks}`
    );
  }
  await lib.clickInContextWithDelay(lib.id(selectors.nextSlide, doc), win);
  yield lib.stateWithMsgNoWait(
    `Viewed final slide #${numSlides} of deck #${totalSlideDecks}`
  );
}

/**
 * @return {AsyncIterableIterator<*>}
 */
async function* handleSlideDeck() {
  lib.collectOutlinksFromDoc();
  yield* consumeSlides(window, document, selectors.sectionSlide);
  lib.collectOutlinksFromDoc();
}

/**
 * @param {Window} win
 * @param {Document} doc
 * @return {AsyncIterableIterator<*>}
 */
async function* doSlideShowInFrame(win, doc) {
  const decks = lib.qsa('li', lib.qs(selectors.relatedDecks, doc));
  const numDecks = decks.length;
  const deckIF = lib.qs(selectors.iframeLoader, doc);
  yield* consumeSlides(
    deckIF.contentWindow,
    deckIF.contentDocument,
    selectors.divSlide
  );
  for (var i = 0; i < numDecks; ++i) {
    await lib.waitForEventTargetToFireEvent(deckIF, 'load');
    lib.addOutlink(decks[i].firstElementChild);
    lib.clickInContext(decks[i].firstElementChild, win);
    yield* consumeSlides(
      deckIF.contentWindow,
      deckIF.contentDocument,
      selectors.divSlide
    );
  }
}

/**
 * @return {AsyncIterableIterator<*>}
 */
export default function init(cliAPI) {
  if (lib.canAccessIf(lib.qs(selectors.iframeLoader))) {
    // 'have iframe loader in top'
    return doSlideShowInFrame(window, document);
  }
  const maybeIF = lib.findTag(cliAPI.$x, 'iframe', isSlideShelfIF);
  if (maybeIF && lib.canAccessIf(maybeIF)) {
    // have slideself loader in top
    return doSlideShowInFrame(maybeIF.contentWindow, maybeIF.contentDocument);
  }
  // have slides in top
  return handleSlideDeck();
}

export const metadata = {
  name: 'slideShareBehavior',
  match: {
    regex: /^(?:https:\/\/(?:www\.)?)slideshare\.net\/[a-zA-Z]+[?].+/,
  },
  description:
    'Capture each slide contained in the slide deck. If there are multiple slide decks, view and capture each deck.',
  updated: '2019-06-24T15:09:02',
};

export const isBehavior = true;
