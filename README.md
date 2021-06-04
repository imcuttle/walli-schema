# walli-schema

[![Build status](https://img.shields.io/travis/imcuttle/walli-schema/master.svg?style=flat-square)](https://travis-ci.com/imcuttle/walli-schema)
[![Test coverage](https://img.shields.io/codecov/c/github/imcuttle/walli-schema.svg?style=flat-square)](https://codecov.io/github/imcuttle/walli-schema?branch=master)
[![NPM version](https://img.shields.io/npm/v/walli-schema.svg?style=flat-square)](https://www.npmjs.com/package/walli-schema)
[![NPM Downloads](https://img.shields.io/npm/dm/walli-schema.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/walli-schema)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

> walli schema to walli

## Installation

```bash
npm install walli-schema
# or use yarn
yarn add walli-schema
```

## Usage

```javascript
import { schemaToWalli, createSchemaToWalli } from 'walli-schema'

const verifiable = schemaToWalli({
  $type: 'leq',
  rule: {
    $type: 'every',
    rule: [
      {
        $type: 'leq',
        rule: {
          a: 1
        }
      },
      {
        $type: 'oneOf',
        rule: [
          {
            $type: 'leq',
            rule: {
              b: 2,
              c: 3
            }
          },
          {
            $type: 'leq',
            rule: {
              b: 3,
              c: 2
            }
          }
        ]
      }
    ]
  }
})

expect(
  verifiable.ok({
    a: 1
  })
).toBeFalsy()

expect(
  verifiable.ok({
    a: 1,
    b: 2
  })
).toBeFalsy()
//
expect(
  verifiable.ok({
    a: 1,
    b: 2,
    c: 3
  })
).toBeTruthy()

expect(
  verifiable.ok({
    a: 1,
    b: 3,
    c: 2
  })
).toBeTruthy()

const customSchemaToWalli = createSchemaToWalli({
  string: walli.string
  // custom... $types
})
```

## Contributing

- Fork it!
- Create your new branch:  
  `git checkout -b feature-new` or `git checkout -b fix-which-bug`
- Start your magic work now
- Make sure npm test passes
- Commit your changes:  
  `git commit -am 'feat: some description (close #123)'` or `git commit -am 'fix: some description (fix #123)'`
- Push to the branch: `git push`
- Submit a pull request :)

## Authors

This library is written and maintained by imcuttle, <a href="mailto:moyuyc95@gmail.com">moyuyc95@gmail.com</a>.

## License

MIT - [imcuttle](https://github.com/imcuttle) 🐟
