/**
 * walli schema to walli
 * @author imcuttle
 */
import * as w from 'walli'
import * as clone from 'lodash.clonedeep'
import { sync as visit } from '@moyuyc/visit-tree'
import { Verifiable } from 'walli'

type Rule<T extends Verifiable = Verifiable> = ((rule: any, opts: any) => T) | ((...args: any[]) => T) | T

export type WalliSet<T extends Verifiable = Verifiable> = {
  [type: string]: Rule<T>
}

export type WalliSchema<Keys extends string = string> = {
  $type: Keys
  rule?: (WalliSchema<Keys> & { $type?: Keys }) | any
  options?: any
  required?: boolean
  optional?: boolean
}

// type Options<T> = {
//   defaultType?: keyof T
// }

type ToWalliOptions = {
  throwError?: boolean
  silent?: boolean
}

export function createSchemaToWalli<T extends WalliSet | any>(walliSet: T) {
  return function schemaToWalli<R extends Verifiable = Verifiable>(
    // @ts-ignore
    schema: WalliSchema<keyof T>,
    opts?: ToWalliOptions
  ) {
    let rootVerifiable: any
    const { silent = false, throwError } = opts || {}

    const cloned = clone(schema)
    visit(
      cloned,
      () => {},
      (schema: WalliSchema, ctx) => {
        let { $type, rule, options, required, optional } = schema
        if (!$type && !!ctx.parent) {
          rootVerifiable = schema
          return
        }

        const walliInstance: Rule = walliSet[$type] || walliSet[`${$type}_`]
        if (!walliInstance) {
          const msg = `$type: ${JSON.stringify($type)}, ${JSON.stringify($type + '_')} is not found.`
          if (!throwError && !silent) {
            console.error(`[walli-schema] ${msg}`)
          }
          if (throwError) {
            throw new Error(msg)
          }
          rootVerifiable = schema
          return
        }

        if (typeof walliInstance === 'function') {
          rootVerifiable = walliInstance(rule, options)
          if (required) {
            rootVerifiable = rootVerifiable.required
          } else if (optional) {
            rootVerifiable = rootVerifiable.optional
          }
          ctx.replace(rootVerifiable)
          return
        }
        rootVerifiable = walliInstance
        if (required) {
          rootVerifiable = rootVerifiable.required
        } else if (optional) {
          rootVerifiable = rootVerifiable.optional
        }
        ctx.replace(rootVerifiable)
      },
      {
        path: 'rule'
      }
    )

    return rootVerifiable as R
  }
}

export const schemaToWalli = createSchemaToWalli(w)
