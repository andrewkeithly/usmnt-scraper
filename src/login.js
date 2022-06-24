import * as puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);

  async function waitForSelectors(selectors, frame, options) {
    for (const selector of selectors) {
      try {
        return await waitForSelector(selector, frame, options);
      } catch (err) {
        console.error(err);
      }
    }
    throw new Error(
      'Could not find element for selectors: ' + JSON.stringify(selectors)
    );
  }

  async function scrollIntoViewIfNeeded(element, timeout) {
    await waitForConnected(element, timeout);
    const isInViewport = await element.isIntersectingViewport({threshold: 0});
    if (isInViewport) {
      return;
    }
    await element.evaluate(element => {
      element.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'auto',
      });
    });
    await waitForInViewport(element, timeout);
  }

  async function waitForConnected(element, timeout) {
    await waitForFunction(async () => {
      return await element.getProperty('isConnected');
    }, timeout);
  }

  async function waitForInViewport(element, timeout) {
    await waitForFunction(async () => {
      return await element.isIntersectingViewport({threshold: 0});
    }, timeout);
  }

  async function waitForSelector(selector, frame, options) {
    if (!Array.isArray(selector)) {
      selector = [selector];
    }
    if (!selector.length) {
      throw new Error('Empty selector provided to waitForSelector');
    }
    let element = null;
    for (let i = 0; i < selector.length; i++) {
      const part = selector[i];
      if (element) {
        element = await element.waitForSelector(part, options);
      } else {
        element = await frame.waitForSelector(part, options);
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('>>'));
      }
      if (i < selector.length - 1) {
        element = (
          await element.evaluateHandle(el =>
            el.shadowRoot ? el.shadowRoot : el
          )
        ).asElement();
      }
    }
    if (!element) {
      throw new Error('Could not find element: ' + selector.join('|'));
    }
    return element;
  }

  async function waitForElement(step, frame, timeout) {
    const count = step.count || 1;
    const operator = step.operator || '>=';
    const comp = {
      '==': (a, b) => a === b,
      '>=': (a, b) => a >= b,
      '<=': (a, b) => a <= b,
    };
    const compFn = comp[operator];
    await waitForFunction(async () => {
      const elements = await querySelectorsAll(step.selectors, frame);
      return compFn(elements.length, count);
    }, timeout);
  }

  async function querySelectorsAll(selectors, frame) {
    for (const selector of selectors) {
      const result = await querySelectorAll(selector, frame);
      if (result.length) {
        return result;
      }
    }
    return [];
  }

  async function querySelectorAll(selector, frame) {
    if (!Array.isArray(selector)) {
      selector = [selector];
    }
    if (!selector.length) {
      throw new Error('Empty selector provided to querySelectorAll');
    }
    let elements = [];
    for (let i = 0; i < selector.length; i++) {
      const part = selector[i];
      if (i === 0) {
        elements = await frame.$$(part);
      } else {
        const tmpElements = elements;
        elements = [];
        for (const el of tmpElements) {
          elements.push(...(await el.$$(part)));
        }
      }
      if (elements.length === 0) {
        return [];
      }
      if (i < selector.length - 1) {
        const tmpElements = [];
        for (const el of elements) {
          const newEl = (
            await el.evaluateHandle(el => (el.shadowRoot ? el.shadowRoot : el))
          ).asElement();
          if (newEl) {
            tmpElements.push(newEl);
          }
        }
        elements = tmpElements;
      }
    }
    return elements;
  }

  async function waitForFunction(fn, timeout) {
    let isActive = true;
    setTimeout(() => {
      isActive = false;
    }, timeout);
    while (isActive) {
      const result = await fn();
      if (result) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timed out');
  }
  {
    const targetPage = page;
    await targetPage.setViewport({width: 1129, height: 952});
  }
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    await targetPage.goto('https://www.transfermarkt.us/');
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    const element = await waitForSelectors([['#login > span']], targetPage, {
      timeout,
      visible: true,
    });
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 6.25, y: 18}});
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [['aria/Username'], ['#LoginForm_username']],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 129.5, y: 17}});
    await element.type(process.env.TRANSFERMARKT_USERNAME);
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [['aria/Password'], ['#LoginForm_password']],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 115.5, y: 20}});
    await element.type(process.env.TRANSFERMARKT_PASSWORD);
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [
        ['aria/Login'],
        ['#login-form > fieldset > div:nth-child(7) > div > input'],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 24.796875, y: 17}});
  }
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    const element = await waitForSelectors(
      [
        ['aria/Login'],
        ['#login-form > fieldset > div:nth-child(7) > div > input'],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    const type = await element.evaluate(el => el.type);
    if (
      [
        'textarea',
        'select-one',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email',
      ].includes(type)
    ) {
      await element.type('Login');
    } else {
      await element.focus();
      await element.evaluate((el, value) => {
        el.value = value;
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
      }, 'Login');
    }
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [
        [
          '#main > header > div.row.hide-on-print.navihalter > div > div > ul > li:nth-child(7) > span',
        ],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 15.7265625, y: 5}});
  }
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    const element = await waitForSelectors(
      [
        ['aria/Player watchlist'],
        [
          '#main > header > div.row.hide-on-print.navihalter > div > div > ul > li:nth-child(7) > div > div:nth-child(1) > ul > li:nth-child(2) > ul > li:nth-child(1) > a',
        ],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 59.5, y: 16}});
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [
        [
          '#main > div:nth-child(13) > div.large-8.columns > div > div.tm-tabs > a:nth-child(2) > div > span',
        ],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 29.015625, y: 14}});
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [
        [
          '#main > div:nth-child(13) > div.large-8.columns > div > div.tm-tabs > a:nth-child(3) > div > span',
        ],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 27.96875, y: 8}});
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [
        [
          '#main > div:nth-child(13) > div.large-8.columns > div > div.tm-tabs > a:nth-child(4) > div > span',
        ],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 44.3046875, y: 15}});
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [
        [
          '#main > div:nth-child(13) > div.large-8.columns > div > div.tm-tabs > a:nth-child(5) > div > span',
        ],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 19.9453125, y: 12}});
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [
        [
          '#main > div:nth-child(13) > div.large-8.columns > div > div.tm-tabs > a:nth-child(6) > div > span',
        ],
      ],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 30.7890625, y: 12}});
  }
  {
    const targetPage = page;
    const element = await waitForSelectors(
      [['aria/2'], ['#gridMarktwert > div.pager > ul > li:nth-child(2) > a']],
      targetPage,
      {timeout, visible: true}
    );
    await scrollIntoViewIfNeeded(element, timeout);
    await element.click({offset: {x: 17.8125, y: 13.5}});
  }

  await browser.close();
})();
