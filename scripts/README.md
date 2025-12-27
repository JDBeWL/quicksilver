# Scripts Directory Structure

This directory contains organized scripts for different aspects of the Quicksilver blog system.

## Directory Structure

### `/database` - Database Management Scripts
Scripts for database operations, migrations, and configuration switching.

- **`migrate-data.ts`** - Import/export database data between environments
  - Usage: `ts-node scripts/database/migrate-data.ts [export|import]`
  - Export: Creates `data-export.json` with current database state
  - Import: Restores data from `data-export.json`

- **`switch-db.js`** - Switch between SQLite and PostgreSQL configurations
  - Usage: `node scripts/database/switch-db.js [sqlite|postgresql]`
  - Updates `.env` and `prisma/schema.prisma` files
  - Requires running `npx prisma generate` and `npx prisma db push` after switching

- **`export-local-db.js`** - Export local SQLite database for Supabase migration
  - Automatically detects SQLite and exports data
  - Generates both JSON export and SQL import script
  - Creates `db-export.json` and `import-to-supabase.sql`

### `/user-management` - User Administration Scripts
Scripts for managing users, roles, and access control.

- **`create-admin.ts`** - Interactive admin user creation
  - Prompts for email, name, and password
  - Hashes password and creates admin user in database
  - Checks for existing users to prevent duplicates

- **`generate-invite.ts`** - Generate invitation codes for new user registration
  - Creates codes in format: `INV-XXXX-XXXX`
  - Sets expiration to 7 days from generation
  - Uses cryptographically secure random generation

### `/security` - Security and Testing Tools
Scripts for security configuration and vulnerability testing.

- **`generate-secrets.js`** - Generate secure cryptographic keys
  - Creates JWT_SECRET and AUTH_SECRET
  - Uses 32-byte random hex strings
  - Outputs ready-to-use .env format

- **`test-security.ts`** - Test security middleware and protections
  - Tests Content-Type validation (expects 415)
  - Tests Origin validation (expects 403 for invalid origins)
  - Tests valid request handling (expects 401/404 after security passes)
  - Requires server to be running on http://localhost:3000

### `/utils` - Utility Scripts
General purpose utility scripts.

*(Reserved for future utility scripts)*

## Data Files

- **`db-export.json`** - Exported database data from `export-local-db.js`
- **`../data-export.json`** - Alternative export location from `migrate-data.ts`

## Usage Guidelines

1. **Database Operations**: Always backup before running migration scripts
2. **User Management**: Run `create-admin.ts` only when setting up initial admin access
3. **Security**: Regenerate secrets when rotating credentials
4. **Testing**: Ensure server is running before executing security tests

## Adding New Scripts

When adding new scripts:
1. Place in appropriate subdirectory based on functionality
2. Update this README with script description and usage
3. Consider adding npm script aliases in `package.json` for frequently used scripts
4. Include proper error handling and user feedback