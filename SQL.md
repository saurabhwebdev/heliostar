# SQL Server setup and Prisma usage

This guide documents how to configure Microsoft SQL Server for this app and how to use Prisma as the ORM.

Contents
- Prerequisites
- Configure SQL Server networking
  - Option A: Static TCP port (recommended)
  - Option B: Named instance (dynamic port) with SQL Browser
- Change connection target (localhost → remote or different instance)
- Fresh installation checklist
- App environment variables (mssql driver)
- Test connectivity
- Prisma ORM
  - Install and generate
  - Connection string (DATABASE_URL) examples
  - Common commands
- Troubleshooting

Prerequisites
- Microsoft SQL Server (Developer or Express) installed locally
- Optional: SSMS (SQL Server Management Studio)

Configure SQL Server networking
You must ensure SQL Server listens on TCP and your app can reach it.

Option A: Static TCP port (recommended)
1) Open “SQL Server Configuration Manager”
2) SQL Server Network Configuration → Protocols for SQLEXPRESS (or your instance)
3) Enable “TCP/IP”
4) Right-click “TCP/IP” → Properties → IP Addresses tab → at the bottom (IPAll):
   - Clear “TCP Dynamic Ports” (leave blank)
   - Set “TCP Port” to 1433 (or another free port, e.g., 14330)
5) Restart the service “SQL Server (SQLEXPRESS)”
6) Allow the port on Windows Firewall (as Administrator):
   PowerShell
   New-NetFirewallRule -DisplayName "Allow SQL Server TCP 1433" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow

Option B: Named instance with SQL Browser (dynamic port)
1) Ensure “SQL Server Browser” service is running
2) Allow UDP 1434 on Windows Firewall (as Administrator):
   PowerShell
   New-NetFirewallRule -DisplayName "Allow SQL Browser UDP 1434" -Direction Inbound -Protocol UDP -LocalPort 1434 -Action Allow
3) Keep TCP/IP enabled for the instance
4) Use the instance name in the app (e.g., localhost\\SQLEXPRESS)

Change connection target (localhost → remote or different instance)
- Update these variables to point to the new server and database:
  - .env (for Prisma CLI) and .env.local (for the Next.js app runtime)
  - MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD
  - DATABASE_URL
- Examples:
  - Static port to remote host/IP:
    ini
    DATABASE_URL="sqlserver://10.0.0.25:1433;database=heliostar;user=appuser;password=STRONG_PASS;encrypt=true;trustServerCertificate=true;"
    MSSQL_SERVER=10.0.0.25,1433
    MSSQL_DATABASE=heliostar
    MSSQL_USER=appuser
    MSSQL_PASSWORD=STRONG_PASS
  - Named instance (requires SQL Browser on the remote host):
    ini
    DATABASE_URL="sqlserver://db.example.com\\SQLEXPRESS;database=heliostar;user=appuser;password=STRONG_PASS;encrypt=true;trustServerCertificate=true;"
    MSSQL_SERVER=db.example.com\\SQLEXPRESS
- Networking and security for remote servers:
  - Open inbound TCP on the chosen port (e.g., 1433) on the SQL Server host’s firewall and any network firewalls.
  - If using a named instance/dynamic ports, ensure UDP 1434 (SQL Browser) is reachable.
  - Prefer a static TCP port in production to simplify firewall rules.
  - TLS: In development you can set trustServerCertificate=true. In production, install a proper server certificate and set trustServerCertificate=false.
- After changing env files:
  1) Stop the dev server
  2) npm run prisma:generate (regenerates client)
  3) Restart the dev server

Fresh installation checklist
1) Install Microsoft SQL Server (Developer/Express) and SSMS (optional)
2) Enable TCP/IP and set a static port (e.g., 1433) via SQL Server Configuration Manager
3) Open firewall ports:
   - Windows host PowerShell
     powershell
     New-NetFirewallRule -DisplayName "Allow SQL Server TCP 1433" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
   - For named instances add UDP 1434
4) Create a database and a SQL login with db_owner on that database (or use your desired permissions model)
5) Create .env and .env.local with matching values:
   - .env (Prisma CLI)
     ini
     DATABASE_URL="sqlserver://127.0.0.1:1433;database=heliostar;user=admin;password=admin;encrypt=true;trustServerCertificate=true;"
   - .env.local (Next.js runtime)
     ini
     MSSQL_DRIVER=tedious
     MSSQL_SERVER=127.0.0.1,1433
     MSSQL_DATABASE=heliostar
     MSSQL_USER=admin
     MSSQL_PASSWORD=admin
     MSSQL_ENCRYPT=true
     MSSQL_TRUST_SERVER_CERTIFICATE=true
     MSSQL_CONNECT_TIMEOUT_MS=30000
     MSSQL_REQUEST_TIMEOUT_MS=30000
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="development-secret-change-me"
6) Install dependencies
   bash
   npm install
7) Generate Prisma client (ensure the dev server is stopped to avoid EPERM locks on Windows)
   bash
   npm run prisma:generate
8) Apply migrations and seed
   bash
   npm run prisma:migrate -- --name init
   npx prisma db seed
9) Start the dev server
   bash
   npm run dev
10) Test connectivity
    bash
    curl http://localhost:3000/api/db/ping
    # Expect {"ok":true}

App environment variables (mssql driver)
The app’s low-level driver uses these variables (see src/lib/db/mssql.ts):
- MSSQL_DRIVER=tedious
- MSSQL_SERVER
  - For static port: 127.0.0.1,1433
  - For named instance: localhost\SQLEXPRESS
- MSSQL_DATABASE=heliostar
- MSSQL_USER=admin
- MSSQL_PASSWORD=admin
- MSSQL_ENCRYPT=true
- MSSQL_TRUST_SERVER_CERTIFICATE=true
- MSSQL_CONNECT_TIMEOUT_MS=30000
- MSSQL_REQUEST_TIMEOUT_MS=30000

Test connectivity
- Start the app
- Hit the ping endpoint
  curl http://localhost:3000/api/db/ping
- You should see {"ok":true}. The server log shows the final config (password masked).

Prisma ORM
Install and generate
Prisma is included in the project with a SQL Server datasource. The Prisma client lives at src/lib/db/prisma.ts.

- Install dependencies (already done for the repo):
  - @prisma/client (runtime) and prisma (dev)
- After you set DATABASE_URL in your local .env, generate the client:
  npm run prisma:generate

Connection string (DATABASE_URL) examples
Prisma uses a SQL Server connection string in this format.

- Static port (recommended):
  sql
  sqlserver://127.0.0.1:1433;database=heliostar;user=admin;password=admin;encrypt=true;trustServerCertificate=true;

- Named instance (requires SQL Browser / UDP 1434):
  sql
  sqlserver://localhost\\SQLEXPRESS;database=heliostar;user=admin;password=admin;encrypt=true;trustServerCertificate=true;

Place DATABASE_URL in your .env (not committed):
- Example:
  ini
  DATABASE_URL="sqlserver://127.0.0.1:1433;database=heliostar;user=admin;password=admin;encrypt=true;trustServerCertificate=true;"

Common commands
- Generate Prisma client
  npm run prisma:generate
- Run Prisma Studio (data browser)
  npm run prisma:studio
- Create a migration (when you add models to schema.prisma)
  npm run prisma:migrate -- --name init

Troubleshooting
- Error: "Port for SQLEXPRESS not found in localhost"
  - SQL Browser not reachable (UDP 1434), or TCP/IP disabled for instance
  - Fix: enable TCP/IP; allow UDP 1434; or switch to static port and use MSSQL_SERVER=127.0.0.1,1433

- Error: "Failed to connect to localhost:1433 - Could not connect (sequence)"
  - SQL Server isn’t listening on 1433 or firewall is blocking
  - Fix: set a static TCP port (1433), restart SQL Server service, open firewall, and use 127.0.0.1,1433

- Verify the listener (PowerShell):
  Get-NetTCPConnection -LocalPort 1433 -State Listen

- Find your current session’s port in SSMS:
  SELECT local_tcp_port FROM sys.dm_exec_connections WHERE session_id = @@SPID;

Notes
- For local dev, encrypt=true and trustServerCertificate=true are common.
- SSMS can connect via Shared Memory and succeed even if TCP/IP isn’t configured—your app requires TCP/IP.
