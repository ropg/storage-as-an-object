# allmixedup Jail

## Overview
**Hostname**: allmixedup  
**Internal IP**: 10.42.0.10  
**IPv6**: 2a01:4f9:3100:4b60:1010::1  
**Purpose**: Web-based UI (likely for mix network or similar service)

## Configuration
- **ZFS Dataset**: rpool/ezjail/allmixedup (1.67GB)
- **Root Directory**: /usr/jails/allmixedup
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### Base System
- FreeBSD 14.3 base system
- Nano editor
- sudo

### Utilities
- curl 8.16.0
- expat 2.7.3
- git 2.51.0
- gmake 4.4.1
- go 1.24 (Go programming language)
- python3 3.11

### Web
- Apache 2.4
- mod_php85 8.5.1 (PHP)
- PHP extensions: bcmath, ctype, curl, dom, exif, fileinfo, filter, gd, iconv
- intl, mbstring, mysqli, opcache, pcntl, pdo, pdo_mysql, pdo_sqlite
- phar, posix, session, simplexml, sqlt3, tokenizer, xml, xmlwriter
- zip, zlib

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Apache HTTP | 8443 | TCP | Web UI (HTTPS) |

## Network Configuration
- **Internal IP**: 10.42.0.10 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1010::1 (igb0)
- Web accessible on port 8443

## Usage Notes
1. This jail hosts a web-based interface (likely for mix network management)
2. Accessible on port 8443 from external network
3. Uses PHP 8.5 with various extensions

## Related Commands
```bash
# Console into allmixedup jail
con allmixedup

# Restart Apache
service apache24 restart

# Access web interface
https://pietje.rop.nl:8443/
```
