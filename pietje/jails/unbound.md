# unbound Jail

## Overview
**Hostname**: unbound  
**Internal IP**: 10.42.0.1  
**IPv6 (local)**: fc42::1  
**Purpose**: Recursive DNS resolver

## Configuration
- **ZFS Dataset**: rpool/ezjail/unbound (122MB)
- **Root Directory**: /usr/jails/unbound
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### DNS Resolver
- Unbound 1.23.1 (validating, recursive, caching DNS resolver)

### Utilities
- bind-tools 9.20.13 (dig, host, nslookup, etc.)
- nano editor
- sudo

### Networking
- libevent 2.1.12
- libuv 1.51.0

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Unbound DNS | 53 | UDP/TCP | Recursive DNS resolver |

## Network Configuration
- **Internal IP**: 10.42.0.1 (lo42)
- **Local IPv6**: fc42::1 (local resolver)
- DNS accessible from other jails on internal network

## Usage Notes
1. This is a recursive DNS resolver for internal use
2. Caches DNS queries for improved performance
3. Validates DNSSEC records when possible

## Related Commands
```bash
# Console into unbound jail
con unbound

# Start/stop Unbound
service unbound start
service unbound stop

# Check configuration
unbound-checkconf

# Test DNS resolution
dig @10.42.0.1 google.com
```
