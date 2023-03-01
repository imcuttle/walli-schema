/**
 * walli schema to walli
 * @author imcuttle
 */
import * as w from 'walli'
import { createSchemaToWalli } from './create'

export const schemaToWalli = createSchemaToWalli(w)
export * from './create'
