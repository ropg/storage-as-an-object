# OpenZFS on macOS Setup for Monster

**Date:** October 18, 2026  
**macOS Version:** 26.6.2 (Tahoe)  
**Hardware:** Mac Studio M4 Max

## Overview

This document describes the OpenZFS setup on the Monster system, including native Time Machine backup volumes and FreeBSD replication capabilities.

## ZFS Pool

### Pool Name: `monster-zpool`

**Configuration:**
- 20 TB mirrored across two drives
- Physical drives: disk4, disk5 (22TB each)
- Health: ONLINE

**Mount Point:** `/Volumes/monster-zpool`

## Datasets

| Dataset | Mount Point | Purpose |
|---------|-------------|---------|
| `monster-zpool/clusterfuck` | `/Volumes/monster-zpool/clusterfuck` | FreeBSD replication dataset |

## APFS Volumes on ZFS zvols

The ZFS pool contains two zvols, each formatted as APFS:

| APFS Volume | Size | Physical Store (ZFS zvol) | Mount Point | Purpose |
|-------------|------|---------------------------|-------------|---------|
| `monster-timemachine` | 4 TB APFS | `monster-zpool/monster-zvol` (disk7) | `/Volumes/monster-timemachine` | Primary Time Machine backup |
| `clusterfuck-backup` | 2 TB APFS | `monster-zpool/clusterfuck-zvol` (disk8) | `/Volumes/clusterfuck-backup` | Secondary backup |

### ZFS zvols (not mounted, internal use)

| ZFS Dataset | Size | Physical Disk |
|-------------|------|---------------|
| `monster-zpool/monster-zvol` | 4 TB | disk7 |
| `monster-zpool/clusterfuck-zvol` | 2 TB | disk8 |

### Disk Numbers Summary

| Mount Point | APFS Container (diskN) | Physical Store (ZFS zvol on diskN) |
|-------------|----------------------|-----------------------------------|
| `/Volumes/monster-timemachine` | disk9 | disk7 (zvol: `monster-zpool/monster-zvol`) |
| `/Volumes/clusterfuck-backup` | disk10 | disk8 (zvol: `monster-zpool/clusterfuck-zvol`) |

## FileVault Encryption

Both Time Machine volumes are encrypted with FileVault. 

**Encryption Password:** [ADD YOUR PASSWORD HERE]

## Installation Steps

### 1. OpenZFS Kernel Extension
- Downloaded: `OpenZFSonOsX-2.4.1p1-Tahoe-26-arm64.pkg`
- Installed: `/Library/Extensions/zfs.kext`
- SIP disabled: `csrutil enable --without kext`

### 2. APFS Volumes on ZFS zvols
- Created as sparse zvols with 64KB volblocksize
- Formatted as APFS
- Encrypted with FileVault

## Commands Reference

```bash
# Check pool status
zpool status monster-zpool
zpool list

# List datasets and zvols
zfs list

# Check Time Machine destinations
tmutil destinationinfo -X

# View disk layout with ZFS volumes
diskutil list | grep -E "monster|clusterfuck"

# View APFS container details
diskutil apfs list /dev/disk9
diskutil apfs list /dev/disk10
```

## Recovery Process

See `monster/zfs/recovery.md` for detailed recovery instructions on a wiped or different Mac.

## Files Location

```
/Users/rop/sysadmin/monster/zfs/
├── zfs.md              # This file
└── recovery.md         # Recovery procedures
```
