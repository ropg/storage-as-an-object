# play Jail

## Overview
**Hostname**: play  
**Internal IP**: 10.42.0.6  
**IPv6**: 2a01:4f9:3100:4b60:1006::1  
**Purpose**: STUN/TURN server + Tor + BitTorrent

## Configuration
- **ZFS Dataset**: rpool/ezjail/play (47.1GB)
- **Root Directory**: /usr/jails/play
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### STUN/TURN
- turnserver 4.6.3 (STUN/TURN server)
- miniupnpc 2.3.2 (UPnP IGD client)

### Tor Network
- tor 0.4.8.20 (anonymizing overlay network)

### BitTorrent
- transmission-cli 4.0.6_5 (BitTorrent client)
- transmission-daemon 4.0.6_5
- transmission-utils 4.0.6_5

### Utilities
- nano editor
- sudo
- curl 8.16.0
- git 2.51.0

### Protobuf Support
- protobuf 29.5
- protobuf-c 1.5.1_3

### Compression
- zstd 1.5.7
- liblz4 1.10.0

### Networking
- fstrm 0.6.1_1 (Frame Streams)
- libevent 2.1.12
- libuv 1.51.0

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| STUN/TURN | 3478 | UDP/TCP | TURN server for WebRTC |
| Transmission | 9091 | TCP | BitTorrent web UI |
| Tor SOCKS | 9050 | TCP | Anonymizing proxy |

## Network Configuration
- **Internal IP**: 10.42.0.6 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1006::1 (igb0)
- STUN/TURN accessible from external network (port 3478)

## Usage Notes
1. STUN/TURN server for WebRTC connectivity
2. Transmission daemon runs in background
3. Tor provides anonymized networking

## Related Commands
```bash
# Console into play jail
con play

# Restart services
service turnserver restart
service transmission restart
service tor restart

# Check STUN status
stunclient --server=pietje.rop.nl --port=3478
```
