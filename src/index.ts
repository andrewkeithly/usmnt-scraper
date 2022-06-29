import {usePage} from './utils/puppeteer';

export async function example() {
  const url =
    'https://www.transfermarkt.us/spieler-statistik/legionaere/statistik?land_id=184&land=40&plus=1';

  const getPages = (): string[] => {
    const paginationElelementArr: HTMLAnchorElement[] = Array.from(
      document.querySelectorAll('.tm-pagination > li > a')
    );
    return Array.from(paginationElelementArr)
      .slice(0, -2)
      .map(el => el.href);
  };

  // This will be executed in-page by the browser's V8
  const pageEvalFn = () => {
    // Because of the above, assert needs to be (re=)defined in the V8 isolate
    // context in order to use it
    function assert(expr: unknown, msg?: string): asserts expr {
      if (!expr) throw new Error(msg);
    }
    const rowsElementArr: HTMLElement[] = Array.from(
      document.querySelectorAll('.items > tbody > tr')
    );

    assert(rowsElementArr, 'Assert document array found');
    const returnRows: Array<string | object> = [];
    rowsElementArr.forEach(documentPart => {
      const imgArray = Array.from(documentPart.querySelectorAll('img')).map(
        el => {
          return {placeholder: el.alt, source: el.currentSrc};
        }
      );

      const parts = documentPart.outerText.split(/\t*\n+\t+\s*|\n*\t+|\n+/);

      returnRows.push({
        index: parts[0],
        name: parts[1],
        position: parts[2],
        age: parts[3],
        birthCity: parts[4],
        birthCountry:
          imgArray.length >= 4
            ? imgArray[2]?.placeholder
            : imgArray[3]?.placeholder,
        teamShort: parts[5],
        team: imgArray[imgArray.length - 1]?.placeholder,
        league: parts[6],
        contractExpiration: parts[7],
        marketValue: parts[8],
        images: imgArray,
      });
    });

    return returnRows;
  };
  const promiseArray: Promise<any>[] = [];
  const pages = await usePage(url, page => page.evaluate(getPages));
  console.log(pages);
  pages?.forEach(pageUrl => {
    promiseArray.push(usePage(url, page => page.evaluate(pageUrl)));
  });

  // Promise.all(promiseArray).then(res => {
  //   const data: Array<string | object> = [...res];
  //   console.table(data);
  // });
  // const todos = await usePage(url, page => page.evaluate(pageEvalFn));
}
