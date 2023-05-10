import * as puppeteer from 'puppeteer';
import type {Page, Viewport} from 'puppeteer';

const PUPPETEER_OPTIONS = {
  headless: false,
  devtools: true,
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--single-process',
    "--proxy-server='direct://'",
    '--proxy-bypass-list=*',
    '--deterministic-fetch',
  ],
};

// You'll need to define these for your specific environment
// https://github.com/puppeteer/puppeteer/blob/v13.2.0/docs/api.md#puppeteerlaunchoptions
export const launchOptions: Parameters<typeof puppeteer['launch']>[0] =
  PUPPETEER_OPTIONS;

export type Fn<
  Params extends readonly unknown[] = unknown[],
  Result = unknown
> = (...params: Params) => Result;

export type OrPromise<T> = T | Promise<T>;

export type UsePageCallback<Result = unknown> = Fn<
  [page: Page],
  OrPromise<Result>
>;

export async function usePage<
  T extends UsePageCallback,
  Result = Awaited<ReturnType<T>>
>(
  options:
    | string
    | {
        viewport?: Viewport;
        goto: {
          url: Parameters<Page['goto']>[0];
          options?: Parameters<Page['goto']>[1];
        };
      },
  callback: T
): Promise<Result> {
  const defaultViewport: Viewport = {width: 1280, height: 800};
  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();
    if (typeof options === 'string') {
      await page.setViewport(defaultViewport);
      await page.goto(options);
    } else {
      const {
        goto: {options: opts, url},
        viewport,
      } = options;
      await page.setViewport(viewport ?? defaultViewport);
      await page.goto(url, opts);
    }
    return (await callback(page)) as Result;
  } finally {
    await browser.close();
  }
}

/**
 * For use when querying within shadow roots.
 *
 * Ref: https://github.com/puppeteer/puppeteer/pull/6509
 *
 * ```ts
 * // const className = 'action';
 * const button = await page.$<HTMLButtonElement>(pierce`#elementWithinAShadowRoot > button.${className}`);
 * ```
 */
export function pierce(
  strings: TemplateStringsArray,
  ...stringExpressions: string[]
): string {
  const mutable = [...strings];
  let selector = 'pierce/';
  while (mutable.length > 0) {
    selector += `${mutable.shift() ?? ''}${stringExpressions.shift() ?? ''}`;
  }
  return selector;
}
