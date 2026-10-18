# db Jail

## Overview
**Hostname**: db  
**Internal IP**: 10.42.0.3  
**Purpose**: MySQL database server

## Configuration
- **ZFS Dataset**: rpool/ezjail/db (1.56GB)
- **Root Directory**: /usr/jails/db
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### Database
- MySQL 8.0 server
- MySQL 8.4 client

### Utilities
- GNU coreutils
- Nano editor
- Perl 5.40.3
- Postfix (MTA)
- sudo

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| MySQL | 3306 | TCP | Database server |
| Postfix | 25, 587, 465 | TCP | Mail transfer agent |

## Network Configuration
- **Internal IP**: 10.42.0.3 (lo42)
- Accessible from other jails on internal network
- Port 3306 is currently firewalled (commented out in pf.conf)

## Usage Notes
1. This jail primarily hosts MySQL database services
2. Postfix is configured but outbound email blocked in pf.conf
3. Database access should be restricted to internal network

## Related Commands
```bash
# Console into db jail
con db

# Start/stop MySQL service
service mysql-server start
service mysql-server stop

# Connect to database (from within jail)
mysql -u root -p
```
