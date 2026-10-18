# ns0 Jail

## Overview
**Hostname**: ns0  
**Internal IP**: 10.42.0.2  
**IPv6**: 2a01:4f9:3100:4b60:1002::1  
**Purpose**: Authoritative DNS server (NSD) with Zone File Helper Tool

## Configuration
- **ZFS Dataset**: rpool/ezjail/ns0 (168MB)
- **Root Directory**: /usr/jails/ns0
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### DNS Server
- NSD 4.13.0 (Authoritative only, non-recursive DNS)

### zfht Toolchain
- **zfht** - Zone file change detection and automation tool
  - Detects changes to zone files and their recursive $INCLUDE dependencies
  - Automatically updates SOA serial numbers via zfht-update-serial
  - Runs user scripts for addzone, modzone, delzone events
  - Supports dry-run mode (-d) and timestamp mode
- **zfht-update-serial** - SOA serial updater (date-based format: YYYYMMDDSS)
- **zfht-sign** - DNSSEC signing automation (key generation, zone signing)

### Utilities
- bind-tools 9.20.16 (dig, host, nslookup, etc.)
- rsync 3.4.1_4
- nano editor
- sudo

### DNS-related Tools
- xxsHash 0.8.3 (fast hashing)
- zstd 1.5.7 (compression)

### Protobuf Support
- protobuf 29.5
- protobuf-c 1.5.1_3

### Fstrm (Frame Streams)
- fstrm 0.6.1_1 (for DNS traffic)

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| NSD DNS | 53 | UDP/TCP | Authoritative DNS |

## Zone File Management

### Directory Structure
```
/usr/local/etc/nsd/
├── master/                 # Zone files go here
│   ├── rop.nl              # Domain zone file
│   └── includes/           # Reusable snippets ($INCLUDE)
├── signed/                 # DNSSEC-signed zones (created by zfht-sign)
├── keys/                   # Key directories
│   ├── ksk/                # Key Signing Keys
│   └── zsk/                # Zone Signing Keys
├── .zfht/                  # User scripts (addzone, modzone, delzone)
└── nsd.conf
```

### Zone File Workflow

1. **Add domain**: Create zone file in `master/` (e.g., `newdomain.com`)
2. **Run zfht**:
   - First run: `zfht -a` (process all) or `zfht -w` (store state)
   - Subsequent runs: `zfht -t` to detect changes and touch files
3. **nsd-control reload** - Reloads NSD with updated zones

### $INCLUDE Directives
- Use relative paths from ZONESDIR
- zfht automatically detects and processes included files recursively

### User Scripts (.zfht/)
- **addzone** - Runs when new zone file appears
- **modzone** - Runs when zone file is modified
- **delzone** - Runs when zone file is deleted

### DNSSEC with zfht-sign
```bash
# Sign a zone (creates signed/ and keys/)
zfht-sign rop.nl master/rop.nl

# Generate DS record in keys/ksk/
```

## Zone File Helper Tool (zfht) Usage

### Commands
```bash
# Dry run mode
zfht -d file1 file2

# Timestamp mode (auto-detect changes)
zfht [no args]              # Show what would change
zfht -w                     # Store current state, exit
zfht -t                     # Touch dependent files after update

# Process all zones
zfht -a                     # Treat all as newly added

# File mode (explicit files)
zfht example.com            # Process specific zone file
```

### Environment Variables
- `ZONESDIR` - Zone file directory (default: current dir)
- `ZONESSUBDIR` - Subdirectory with zone files
- `ZFHT_TODAY` - Override date for serial number (YYYYMMDD)

### Zone File Format
```
$ORIGIN example.com.
$INCLUDE "includes/common"  # Relative path from ZONESDIR
@   IN  SOA ns0. hostmaster. 2025101801 3600 900 1209600 3600
    IN  NS  ns0.
```

## Network Configuration
- **Internal IP**: 10.42.0.2 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1002::1 (igb0)
- DNS accessible from external network

## Usage Notes
1. This is an authoritative-only DNS server (NSD)
2. Does NOT provide recursive resolution
3. Used for hosting zone files for rop.nl and subdomains
4. zfht automates zone file management and DNSSEC signing

## Related Commands
```bash
# Console into ns0 jail
con ns0

# Start/stop NSD
service nsd start
service nsd stop

# Check configuration
nsdc checkconfig

# Reload zones
nsd-control reload

# Sign a zone (DNSSEC)
zfht-sign rop.nl master/rop.nl

# Update zone files
cd /usr/local/etc/nsd
zfht -t
nsd-control reload
```
