import type { Verifiable } from 'walli'
import { sync as visit } from '@moyuyc/visit-tree'
import * as mapObj from 'map-obj'
import * as clone from 'lodash.clonedeep'

export type Rule<T extends Verifiable = Verifiable> = ((rule: any, opts: any) => T) | ((...args: any[]) => T) | T

export type ToWalliOptions = {
  throwError?: boolean
  silent?: boolean
}

function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === null || prototype === Object.prototype
}

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

export function createSchemaToWalli<T extends WalliSet | any>(walliSet: T) {
  return function schemaToWalli<R extends Verifiable = Verifiable>(
    // @ts-ignore
    schema: WalliSchema<keyof T>,
    opts?: ToWalliOptions
  ): R {
    let rootVerifiable: any
    const { silent = false, throwError } = opts || {}
    if (typeof schema !== 'object' || !schema?.$type) {
      return schema as any
    }

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
          const mapRule = (rule) => {
            if (Array.isArray(rule)) {
              return rule.map((r) => mapRule(r))
            }
            if (!isPlainObject(rule)) {
              return rule
            }

            if (rule.$type) {
              return schemaToWalli(rule, opts)
            }

            return mapObj(
              rule,
              // @ts-ignore
              (key: any, sourceValue: any) => {
                return [key, mapRule(sourceValue)]
              },
              { deep: false }
            )
          }
          rootVerifiable = walliInstance(mapRule(rule), options)
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
