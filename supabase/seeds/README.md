# Seed Files

This directory contains modular seed data files for the Obsidian Financial database.

## File Order

The files are numbered to maintain the correct execution order based on foreign key dependencies:

1. **01_users.sql** - Base user accounts (8 users)
2. **02_groups.sql** - Financial groups (3 groups)
3. **03_group_memberships.sql** - User-to-group relationships
4. **04_accounts.sql** - Financial accounts (checking, savings, credit, investment)
5. **05_account_members.sql** - Account ownership and sharing relationships
6. **06_transactions.sql** - Financial transactions (20 sample transactions)
7. **07_account_transactions.sql** - Links transactions to accounts
8. **08_account_group_visibility.sql** - Account visibility within groups
9. **09_invitations.sql** - Group invitations (accepted, pending, declined, expired)
10. **10_password_reset_tokens.sql** - Password reset tokens

## Running Seeds Locally

### Option A: Run all seed files at once (using supabase db reset)

```bash
# This will drop the database, run migrations, and execute all seed files
supabase db reset
```

### Option B: Run individual seed files

```powershell
# On Windows PowerShell
Get-Content supabase/seeds/01_users.sql | supabase db execute --local
Get-Content supabase/seeds/02_groups.sql | supabase db execute --local
# ... etc
```

```bash
# On Linux/Mac
supabase db execute --local < supabase/seeds/01_users.sql
supabase db execute --local < supabase/seeds/02_groups.sql
# ... etc
```

### Option C: Run specific tables

If you only want to seed specific tables, run just those files in dependency order:

```powershell
# Example: Only seed users and groups
Get-Content supabase/seeds/01_users.sql | supabase db execute --local
Get-Content supabase/seeds/02_groups.sql | supabase db execute --local
```

## Data Overview

- **8 Users**: John, Jane, Mike, Sarah, David, Emily, Alex, Lisa
- **3 Groups**: Smith Family (4 members), College Roommates (3 members), Martinez-Davis Couple (2 members)
- **13 Accounts**: Mix of checking, savings, credit, and investment accounts across different banks
- **20 Transactions**: Realistic December 2024 transactions (groceries, utilities, salaries, etc.)
- **Joint Accounts**: Jane & John share a savings account; Emily & Alex share a checking account
- **Authorized Users**: Sarah is an authorized user on Mike's checking account

## Notes

- Each user can only belong to ONE active group at a time (enforced by database constraint)
- All passwords are hashed with bcrypt (test hash: `$2a$10$abcdefghijklmnopqrstuvwxyz123456`)
- Plaid IDs are included for all accounts and transactions
- Sequence numbers are reset after each insert to maintain proper auto-increment behavior
