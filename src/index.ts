import {usePage} from './utils/puppeteer';

export async function example() {
  const url = 'https://github.com/andrewkeithly/usmnt-tracker';

  // This will be executed in-page by the browser's V8
  const todosEvalFn = () => {
    // Because of the above, assert needs to be (re=)defined in the V8 isolate
    // context in order to use it
    function assert(expr: unknown, msg = ''): asserts expr {
      if (!expr) throw new Error(msg);
    }
    const todoHeading = [...document.querySelectorAll('h3')].find(
      h3 => h3.textContent?.trim() === 'To-Do'
    );
    assert(todoHeading, 'To-Do heading not found');

    let siblings = [...(todoHeading.parentElement?.children ?? [])];
    assert(
      siblings.length > 1 && siblings.includes(todoHeading),
      'Sibling elements not found'
    );
    const todoHeadingIndex = siblings.indexOf(todoHeading);
    siblings = siblings.slice(todoHeadingIndex + 1);

    const todosList = siblings.find(
      (elm): elm is HTMLUListElement => elm.nodeName === 'UL'
    );
    assert(todosList, 'List element not found');

    const todos = [...todosList.querySelectorAll(':scope > li')]
      .map(elm => elm.textContent?.trim())
      // It seems a predicate is required to use a predicate as a callback in arr.filter 🤷
      // .filter(Boolean) as string;
      .filter((str): str is string => Boolean(str));
    assert(todos.length > 0, 'Todos not found');

    return todos;
  };

  const todos = await usePage(url, page => page.evaluate(todosEvalFn));
  console.log(todos);

  //=> The following lines are printed to console:
  // [
  //   "build out UI",
  //   "read in data either locally or from a service",
  //   "create accounts",
  //   "formation editor",
  //   "..."
  // ]
}
