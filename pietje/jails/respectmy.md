# respectmy Jail

## Overview
**Hostname**: respectmy  
**Internal IP**: 10.42.0.13  
**IPv6**: 2a01:4f9:3100:4b60:1013::1  
**Purpose**: Katzenpost mix network service

## Configuration
- **ZFS Dataset**: rpool/ezjail/respectmy (271MB)
- **Root Directory**: /usr/jails/respectmy
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### Base System
- FreeBSD 14.3 base system
- Nano editor
- sudo

### Katzenpost Mix Network
- katzenpost (mix network daemon)

### Utilities
- curl 8.16.0
- expat 2.7.3

### Protobuf Support
- protobuf 29.5
- protobuf-c 1.5.1_3

### Networking
- libevent 2.1.12
- libuv 1.51.0

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Katzenport | ? | TCP | Mix network node |

## Network Configuration
- **Internal IP**: 10.42.0.13 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1013::1 (igb0)
- Katzenport accessible from external network

## Usage Notes
1. This jail runs a Katzenport mix network node
2. Mix networks provide anonymized communication
3. Port configuration for Katzenport service should be checked

## Related Commands
```bash
# Console into respectmy jail
con respectmy

# Check Katzenpost status
service katzenpost start
service katzenpost stop
```
