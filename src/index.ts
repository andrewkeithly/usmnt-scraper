import {mkdir, lstat, writeFile} from 'node:fs/promises';
import * as path from 'node:path';

import {assert} from './utils/asserts';
import {usePage} from './utils/puppeteer';

import type {ParsedImageData, ParsedRowData} from './utils/types';
// import {flattenJSON} from './utils/dataHelpers';

const getPages = (): string[] => {
  const pages: string[] = [];
  const baseUrl =
    'https://www.transfermarkt.us/detailsuche/spielerdetail/suche/35872508/page/';

  const lastPage =
    document
      .querySelector<HTMLAnchorElement>(
        '.tm-pagination__list-item--icon-last-page > a'
      )
      ?.href?.match(/(?<=page(\/|=))[\d]+/g)?.[0] ?? '1';
  for (let i = 1; i <= parseInt(lastPage); i++) {
    pages.push(`${baseUrl}${i.toString()}`);
  }
  return pages;
};

// This will be executed in-page by the browser's V8
/* const pageEvalFn = (): ParsedRowData[] => {
  // Because of the above, assert needs to be (re=)defined in the V8 isolate
  // context in order to use it
  function assert(expr: unknown, msg?: string): asserts expr {
    if (!expr) throw new Error(msg);
  }

  const rowsElementArr: HTMLTableRowElement[] = [
    ...document.querySelectorAll<HTMLTableRowElement>('.items > tbody > tr'),
  ];

  assert(rowsElementArr.length > 0, 'Table rows not found');

  return rowsElementArr.map(row => {
    const imgArray: ParsedImageData[] = [
      ...row.querySelectorAll<HTMLImageElement>(':scope img'),
    ].map(el => ({placeholder: el.alt, source: el.currentSrc}));

    const parts = row.outerText.split(/\t*\n*\t+\s*|\n+/);

    return {
      number: parts[0],
      name: parts[1],
      position: parts[2],
      age: parts[3]?.match(/(?<=\()\d+/g)?.[0] ?? '',
      birthdate: parts[3].match(/^(.*)(?= \()/g)?.[0] ?? '',
      height: parts[4],
      team: imgArray[imgArray.length - 2]?.placeholder,
      internationalMatches: parts[7],
      marketValue:
        parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[5] === 'm'
          ? `${parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[1]}${
              parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[3]
            }0000`
          : parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[4] === 'Th.'
          ? `${parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[1]}000`
          : '',
      images: imgArray,
    };
  });
}; */

const getPlayers = (): ParsedRowData[] => {
  // Because of the above, assert needs to be (re=)defined in the V8 isolate
  // context in order to use it
  function assert(expr: unknown, msg?: string): asserts expr {
    if (!expr) throw new Error(msg);
  }

  const rowsElementArr: HTMLTableRowElement[] = [
    ...document.querySelectorAll<HTMLTableRowElement>('.items > tbody > tr'),
  ];

  assert(rowsElementArr.length > 0, 'Table rows not found');

  const nextPageLink = document.querySelector<HTMLAnchorElement>(
    '.tm-pagination__list-item tm-pagination__list-item--icon-next-page > a'
  );

  debugger;

  return rowsElementArr.map(row => {
    const imgArray: ParsedImageData[] = [
      ...row.querySelectorAll<HTMLImageElement>(':scope img'),
    ].map(el => ({placeholder: el.alt, source: el.currentSrc}));

    const parts = row.outerText.split(/\t*\n*\t+\s*|\n+/);

    return {
      number: parts[0],
      name: parts[1],
      position: parts[2],
      age: parts[3]?.match(/(?<=\()\d+/g)?.[0] ?? '',
      birthdate: parts[3].match(/^(.*)(?= \()/g)?.[0] ?? '',
      height: parts[4],
      team: imgArray[imgArray.length - 2]?.placeholder,
      internationalMatches: parts[7],
      marketValue:
        parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[5] === 'm'
          ? `${parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[1]}${
              parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[3]
            }0000`
          : parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[4] === 'Th.'
          ? `${parts?.[8].match(/(\d+)(\.*)(\d*)((m)|(Th.))\s/)?.[1]}000`
          : '',
      images: imgArray,
    };
  });
};

// const processData = (data: ParsedRowData[]) => {};

export async function getPlayersUSMNT() {
  const url =
    'https://www.transfermarkt.us/detailsuche/spielerdetail/suche/42337371';

  // const singleResult = usePage(urls[0], page => page.evaluate(getPages));

  const urls = await usePage(url, page => page.evaluate(getPages));
  assert(urls.length > 0, 'Pagination URLs not found');

  // const urls: string[] = [
  //   'https://www.transfermarkt.us/detailsuche/spielerdetail/suche/35871095',
  // ];

  const results = await usePage(urls[0], page => page.evaluate(getPlayers));
  // const lessURLS = urls.slice(0, 3);

  // const results = await Promise.all(
  //   lessURLS.map(url => usePage(url, page => page.evaluate(pageEvalFn)))
  // );

  // const jsonData = flattenJSON(results);

  // const flatJSON: ParsedRowData[] = results.reduce(
  //   (accumulator, value) => accumulator.concat(value),
  //   []
  // );

  // Since this is CJS:
  const rootDir = path.resolve(__dirname, '..', '..');

  assert(
    (await lstat(path.join(rootDir, 'package.json'))).isFile(),
    '"package.json" not found'
  );

  const dataDir = path.join(rootDir, 'data');
  await mkdir(dataDir, {recursive: true});

  const filePath = path.join(dataDir, 'results.json');
  await writeFile(filePath, JSON.stringify(results));
  console.log(`Data written to ${filePath}`);
}

getPlayersUSMNT();
