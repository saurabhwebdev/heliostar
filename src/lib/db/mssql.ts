/*
  Reusable MSSQL connection pool with env-driven configuration.
  - Supports msnodesqlv8 (Windows Integrated Security) via ODBC connection string
  - Supports standard 'mssql' (tedious) via connection string as well
*/

type ConnectionPool = unknown

// Dynamically import the driver to keep bundles lean and satisfy eslint rules.
function dynamicImport(modulePath: string): Promise<unknown> {
  // Use Function constructor to avoid TS/ESLint attempting to resolve types for optional modules
  const fn = new Function('p', 'return import(p)') as (p: string) => Promise<unknown>
  return fn(modulePath)
}

async function importMssql(): Promise<unknown> {
  try {
    if ((process.env.MSSQL_DRIVER || '').toLowerCase() === 'msnodesqlv8') {
      return await dynamicImport('mssql/msnodesqlv8')
    }
    return await dynamicImport('mssql')
  } catch (e) {
    throw new Error(`Failed to load mssql driver: ${String((e as Error).message || e)}`)
  }
}

type TediousConfig = {
  server: string
  user?: string
  password?: string
  database?: string
  options?: {
    encrypt?: boolean
    trustServerCertificate?: boolean
    instanceName?: string
    port?: number
    enableArithAbort?: boolean
    connectTimeout?: number
    requestTimeout?: number
  }
}

function parseServer(server: string): { host: string; instanceName?: string; port?: number } {
  // Support formats like host\\INSTANCE, host,port
  let host = server
  let instanceName: string | undefined
  let port: number | undefined
  if (server.includes('\\')) {
    const [h, inst] = server.split('\\')
    host = h
    instanceName = inst
  }
  if (server.includes(',')) {
    const [h, p] = server.split(',')
    host = h
    const num = Number(p)
    if (!Number.isNaN(num)) port = num
  }
  return { host, instanceName, port }
}

function buildConnectionConfig(): string | TediousConfig {
  // Prefer a full connection string if provided
  const fromEnv = process.env.MSSQL_CONNECTION_STRING
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv

  const driver = (process.env.MSSQL_DRIVER || 'msnodesqlv8').toLowerCase()
  const serverEnv = process.env.MSSQL_SERVER || 'localhost\\SQLEXPRESS'
  const database = process.env.MSSQL_DATABASE || ''
  const encrypt = (process.env.MSSQL_ENCRYPT ?? 'true').toLowerCase() !== 'false'
  const trust = (process.env.MSSQL_TRUST_SERVER_CERTIFICATE ?? 'true').toLowerCase() !== 'false'

  if (driver === 'msnodesqlv8') {
    // ODBC string for Windows Integrated Security
    const parts = [
      'Driver={ODBC Driver 17 for SQL Server}',
      `Server=${serverEnv}`,
      database ? `Database=${database}` : '',
      'Trusted_Connection=Yes',
      `Encrypt=${encrypt ? 'Yes' : 'No'}`,
      `TrustServerCertificate=${trust ? 'Yes' : 'No'}`,
    ].filter(Boolean)
    return parts.join(';') + ';'
  }

  // Tedious (SQL auth) config object
  const user = process.env.MSSQL_USER || ''
  const password = process.env.MSSQL_PASSWORD || ''
  const { host, instanceName, port } = parseServer(serverEnv)
  const connectTimeout = Number(process.env.MSSQL_CONNECT_TIMEOUT_MS ?? '30000')
  const requestTimeout = Number(process.env.MSSQL_REQUEST_TIMEOUT_MS ?? '30000')

  const cfg: TediousConfig = {
    server: host,
    user: user || undefined,
    password: password || undefined,
    database: database || undefined,
    options: {
      encrypt,
      trustServerCertificate: trust,
      instanceName,
      port,
      enableArithAbort: true,
      connectTimeout,
      requestTimeout,
    },
  }
  return cfg
}

// Keep a single shared pool in the server runtime
declare global {
  // Use a global to reuse the connection pool across server requests
  var __MSSQL_POOL__: ConnectionPool | undefined
}

export async function getMssqlPool(): Promise<ConnectionPool> {
  if (global.__MSSQL_POOL__) return global.__MSSQL_POOL__
  const mod = await importMssql()
  type SqlLike = { connect?: (cs: unknown) => Promise<ConnectionPool> } | { default?: { connect?: (cs: unknown) => Promise<ConnectionPool> } }
  const getSql = (m: unknown): { connect?: (cs: unknown) => Promise<ConnectionPool> } => {
    const maybe = m as SqlLike
    // @ts-expect-error runtime check only
    return (maybe?.default ?? maybe) as { connect?: (cs: string) => Promise<ConnectionPool> }
  }
  const sql = getSql(mod)
  if (typeof sql.connect !== 'function') {
    throw new Error('Loaded mssql module does not expose connect()')
  }
  const cfg = buildConnectionConfig()
  
  // Log config (hide sensitive data)
  if (typeof cfg === 'string') {
    const logString = cfg.replace(/Password=[^;]+/gi, 'Password=*****')
    console.log('[MSSQL] Using connection string:', logString)
  } else {
    const { password, ...logCfg } = cfg
    console.log('[MSSQL] Using tedious config:', { ...logCfg, password: password ? '*****' : undefined })
  }
  
  const pool = await sql.connect(cfg as unknown)
  global.__MSSQL_POOL__ = pool
  return pool
}

export async function query<T = unknown>(q: string): Promise<{ recordset: T[] }> {
  const pool = (await getMssqlPool()) as unknown as { query: (q: string) => Promise<{ recordset: T[] }> }
  const res = await pool.query(q)
  return res as unknown as { recordset: T[] }
}
