/**
 * @file main
 * @author imcuttle
 * @date 2018/4/4
 */
import { schemaToWalli } from '../src'

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
})
