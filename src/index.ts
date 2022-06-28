import {usePage} from './utils/puppeteer';

export async function example() {
  const url = 'https://www.transfermarkt.us/';

  // This will be executed in-page by the browser's V8
  const loginFn = () => {
    // Because of the above, assert needs to be (re=)defined in the V8 isolate
    // context in order to use it
    function assert(expr: unknown, msg = ''): asserts expr {
      if (!expr) throw new Error(msg);
    }
    const loginBtn = [...document.querySelectorAll('#login')];
    assert(loginBtn, 'Login Button not found');

    return loginBtn;
  };

  const login = await usePage(url, page => page.evaluate(loginFn));
  console.log(login);

  //=> The following lines are printed to console:
  // [
  //   "build out UI",
  //   "read in data either locally or from a service",
  //   "create accounts",
  //   "formation editor",
  //   "..."
  // ]
}
