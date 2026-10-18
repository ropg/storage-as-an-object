# cloud Jail

## Overview
**Hostname**: cloud  
**Internal IP**: 10.42.0.7  
**Purpose**: Docker container host + STUN/TURN server

## Configuration
- **ZFS Dataset**: rpool/ezjail/cloud (4.13GB)
- **Root Directory**: /usr/jails/cloud
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### Base System
- FreeBSD 14.3 base system

### Docker & VM Support
- docker (container runtime)
- vm-bhyve (VM management)

### STUN/TURN Services
- turnserver (STUN/TURN server)
- sentinel (TURN server support)

### Web Services
- Apache 2.4
- PHP 8.4 with extensions:
  - bcmath, ctype, curl, dom, exif, fileinfo, filter, gd, iconv, intl
  - mbstring, mysqli, opcache, pcntl, pdo, pdo_mysql, pdo_sqlite
  - pecl-igbinary, pecl-imagick, pecl-lzf, pecl-redis, pecl-zstd
  - posix, session, simplexml, xml, xmlreader, xmlwriter, zip, zlib

### System Services
- Redis (in-memory data structure store)
- D-Bus (message bus system)

### Utilities
- avahi-daemon (mDNS/DNS-SD)
- cupsd (CUPS printing system)
- avahi-dnsconfd
- git_daemon
- rsyncd

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Apache HTTP | 80, 443 | TCP | Web server |
| Redis | 6379 | TCP | In-memory database |
| STUN/TURN | 3478 | UDP/TCP | TURN server for WebRTC |
| D-Bus | - | - | Inter-process communication |

## Network Configuration
- **Internal IP**: 10.42.0.7 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1007::1 (igb0)

## Docker VM
- **Name**: docker
- **Loader**: UEFI
- **CPUs**: 12 vCPUs
- **Memory**: 12GB RAM
- **Datastore**: default
- **Auto-start**: Yes

## Usage Notes
1. To access the Docker VM console: `vm console docker`
2. Exit with Ctrl-a q
3. Manage containers via Docker CLI inside the VM
4. STUN/TURN accessible from external network (port 3478)

## Related Commands
```bash
# Console into cloud jail
con cloud

# Access Docker VM console
vm console docker
# (Ctrl-a q to exit)

# List running VMs
vm list

# Restart cloud services
service redis restart
service apache24 restart
```
