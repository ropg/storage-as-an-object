# www Jail

## Overview
**Hostname**: www  
**Internal IP**: 10.42.0.11  
**IPv6**: 2a01:4f9:3100:4b60:1011::1  
**Purpose**: Web server

## Configuration
- **ZFS Dataset**: rpool/ezjail/www (12.8GB)
- **Root Directory**: /usr/jails/www
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Yes

## Installed Software
### Web Server
- Nginx 1.28.3 (web server and reverse proxy)
- PHP 8.5.1 with extensions:
  - bcmath, ctype, curl, dom, exif, fileinfo, filter, gd, iconv
  - intl, mbstring, mysqli, opcache, pcntl, pdo, pdo_mysql, pdo_sqlite
  - phar, posix, session, simplexml, sqlite3, tokenizer, xml, xmlwriter
  - zip, zlib

### System Services
- Apache 2.4 (alternative web server)
- D-Bus (message bus)

### Utilities
- avahi-daemon (mDNS/DNS-SD)
- avahi-dnsconfd
- git_daemon
- rsyncd
- nano editor
- sudo

### Protobuf Support
- protobuf 29.5
- protobuf-c 1.5.1_3

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Nginx HTTP | 80, 443 | TCP | Web server |
| Apache HTTP | 80, 443 | TCP | Alternate web server |

## Network Configuration
- **Internal IP**: 10.42.0.11 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1011::1 (igb0)
- Web accessible from external network

## Usage Notes
1. Primary web server jail with Nginx as main service
2. PHP 8.5 for dynamic content
3. Avahi for local network discovery
4. rsyncd for file synchronization

## Related Commands
```bash
# Console into www jail
con www

# Restart Nginx
service nginx restart

# Check configuration
nginx -t

# Restart Apache (if used)
service apache24 restart
```
