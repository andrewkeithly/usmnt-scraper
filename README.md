> This is an app for scraping data of the United States Men's National (soccer/association football) team prospects.

### To-Do

- [ ] scrape a source of data
- [ ] format data for consumption
- [ ] store data in a DB (redis?)

### File Structure

```
.
├── .vscode                               // Optional – used to persist VS Code Settings
│   └── settings.json
├── build
│   └── src
│       ├── utils
│       │   ├── asserts.d.ts
│       │   ├── asserts.js
│       │   ├── asserts.js.map
│       │   ├── puppeteer.d.ts
│       │   ├── puppeteer.js
│       │   └── puppeteer.js.map
│       ├── index.d.ts
│       ├── index.js
│       └── index.js.map
├── src
│   ├── utils
│   │   ├── asserts.ts
│   │   └── puppeteer.ts
│   ├── index.ts
│   └── index.ts.bak
├── .eslintignore
├── .eslintrc.json
├── .gcloudignore
├── .gitignore
├── .prettierrc.js
├── CHANGELOG.md
├── LICENSE.md
├── README.md
├── package.json
├── tsconfig.json
└── yarn.lock
```

### Reporting Issues:

- [Github Issues Page](https://github.com/andrewkeithly/usmnt-scrape/issues)

### License

- Licensed under MIT (https://github.com/andrewkeithly/usmnt-scraper/blob/master/LICENSE.md)