# ZFS Recovery Guide for Monster System

**macOS Version:** 26.6.2 (Tahoe)  
**Hardware:** Mac Studio M4 Max

## Overview

This guide describes how to recover ZFS datasets and Time Machine backups on a wiped or different Mac.

## Prerequisites

- macOS Tahoe installer USB drive
- Two 22TB SATA drives (original disk4, disk5)
- Network access to any remaining backup sources
- OpenZFS installer package for Tahoe

## Recovery Steps

### 1. Reinstall macOS

Perform a clean reinstall of macOS on the internal drive (disk0).

### 2. Install OpenZFS

Download and install OpenZFS on OS X:
```
https://github.com/openzfsonosx/openzfs-fork/releases/download/zfs-macOS-2.4.1p1/OpenZFSonOsX-2.4.1p1-Tahoe-26-arm64.pkg
```

**Important:** The OpenZFS 2.4.1p1 package for Tahoe includes all necessary patches:
- Fix raw recv panic
- Fix pageoutv2 deadlock  
- Fix mutex leak

No additional patching is required.

### 3. Disable SIP for Kernel Extensions

Boot into Recovery Mode (hold power button on M4 Macs) and run:
```bash
csrutil enable --without kext
```

### 4. Import ZFS Pool

Connect the two 22TB drives (disk4, disk5) to the system:

```bash
# List disks to identify ZFS pool
diskutil list

# Import the pool
sudo zpool import monster-zpool

# Verify import
zpool list
```

### 5. Recreate APFS Volumes on ZFS zvols

The ZFS zvols need to be recreated, then formatted as APFS:

```bash
# Destroy existing zvols (if any)
sudo zfs destroy -r monster-zpool/monster-zvol
sudo zfs destroy -r monster-zpool/clusterfuck-zvol

# Create new zvols with 64KB block size
sudo zfs create -V 4T -o volblocksize=64K monster-zpool/monster-zvol
sudo zfs create -V 2T -o volblocksize=64K monster-zpool/clusterfuck-zvol

# Format as APFS (disk7 and disk8 will be created)
sudo newfs_apfs -v monster-timemachine /dev/disk7
sudo newfs_apfs -v clusterfuck-backup /dev/disk8

# Mount if not auto-mounted
diskutil mount disk9s1
diskutil mount disk10s1
```

### 6. Unlock FileVault Volumes

```bash
# List volumes to find disk numbers
diskutil apfs list

# Unlock with your encryption password
sudo diskutil apfs unlockVolume /dev/disk9s1 -passphrase "YOUR_PASSWORD"
sudo diskutil apfs unlockVolume /dev/disk10s1 -passphrase "YOUR_PASSWORD"
```

### 7. Reconfigure Time Machine

```bash
# Clear old destinations (if any)
tmutil removedestination -X <old_destination_id>

# Add the new backup destination
sudo tmutil setdestination -a /Volumes/monster-timemachine

# Verify
tmutil destinationinfo -X
```

### 8. FreeBSD Replication

The `clusterfuck` dataset is available at `/Volumes/monster-zpool/clusterfuck` for FreeBSD server replication.

## Disk Mapping Reference

| APFS Volume | Container (diskN) | Physical Store (ZFS zvol on diskN) |
|-------------|------------------|-----------------------------------|
| `monster-timemachine` | disk9 | disk7 (zvol: `monster-zpool/monster-zvol`) |
| `clusterfuck-backup` | disk10 | disk8 (zvol: `monster-zpool/clusterfuck-zvol`) |

## Recovery Files Location

On the current system:
```
/Users/rop/sysadmin/monster/zfs/
├── zfs.md              # Current configuration
└── recovery.md         # This file
```

## Troubleshooting

### ZFS Pool Won't Import

If `zpool import` fails:
```bash
# Force import with alternative location
sudo zpool import -f -R /mnt monster-zpool

# Check disk status
zpool status -x
```

### Kernel Extension Not Loading

```bash
# Check if extension is installed
ls -la /Library/Extensions/zfs.kext

# Load manually (after SIP is properly configured)
sudo kmutil load -b org.openzfsonosx.zfs

# Check loaded extensions
kmutil showloaded | grep -i zfs
```

**Note:** SIP must be disabled with `csrutil enable --without kext` in Recovery Mode.

### Disk Not Found

```bash
# Refresh disk list
diskutil list
```

## Emergency Recovery

If the original system is completely lost:

1. Install macOS on new hardware
2. Download and install OpenZFS for Tahoe:
   ```
   https://github.com/openzfsonosx/openzfs-fork/releases/download/zfs-macOS-2.4.1p1/OpenZFSonOsX-2.4.1p1-Tahoe-26-arm64.pkg
   ```
3. Disable SIP: `csrutil enable --without kext` in Recovery Mode
4. Connect original drives (disk4, disk5)
5. Import pool as described above
6. Recreate ZFS zvols and APFS volumes as in Step 5

## Notes

- The OpenZFS kernel extension (`zfs.kext`) is installed via the package
- SIP must be disabled with `--without kext` flag for kernel extension to load
- APFS encryption password must be known to unlock backup volumes
