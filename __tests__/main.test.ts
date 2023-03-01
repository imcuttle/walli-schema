/**
 * @file main
 * @author imcuttle
 * @date 2018/4/4
 */
import { schemaToWalli } from '../src'

import { sync as visit } from '@moyuyc/visit-tree'

const getRules = (v) => {
  let nodes: any[] = []
  visit(
    v,
    (node) => {
      nodes.push(node)
    },
    { path: 'rule' }
  )
  return nodes
}

describe('walliSchema', function () {
  it('should spec', function () {
    expect(
      schemaToWalli({
        $type: 'string'
      })
    ).toMatchSnapshot()

    expect(
      schemaToWalli({
        $type: 'leq',
        rule: {
          abc: 'test'
        }
      }).ok({
        abc: 'test',
        x: 1
      })
    ).toBeTruthy()

    const w = schemaToWalli({
      $type: 'leq',
      rule: {
        data: {
          $type: 'leq',
          rule: {
            redirect: {
              $type: 'trueLike'
            }
          }
        }
      }
    })
    expect(
      w.ok({
        data: {
          redirect: null,
          x: {}
        }
      })
    ).toBeFalsy()

    expect(
      w.ok({
        data: {
          redirect: {
            need_redirect: {}
          }
        }
      })
    ).toBeTruthy()
  })

  it('should deep', function () {
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
  })

  it('should deep passed', function () {
    const verifiable = schemaToWalli({
      $type: 'leq',
      rule: {
        $type: 'every',
        rule: [
          {
            $type: 'leq',
            rule: {
              a: {
                x: 1,
                y: 2
              },
              d: [
                {
                  x: 1,
                  y: 2
                },
                {
                  $type: 'eq',
                  rule: {
                    x: 1,
                    y: 2
                  }
                }
              ]
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

    expect(getRules(verifiable)).toMatchSnapshot()
  })
})
