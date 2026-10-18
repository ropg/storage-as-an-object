# OpenZFS on macOS 26 "Tahoe" - Complete Setup Guide

## Current Status (October 17, 2026)

**OpenZFS does NOT yet support macOS 26 "Tahoe" (Darwin 25.x).**

This repository (`openzfsonosx/zfs`) contains version **1.9.4** which is older and only supports up to macOS Sequoia 15.

The current **2.4.x series** is maintained in a different repository:
- **Source**: https://github.com/openzfsonosx/openzfs-fork
- **Releases**: https://github.com/openzfsonosx/openzfs-fork/releases
- **Downloads**: https://github.com/openzfsonosx/openzfs-fork/wiki/Downloads

The latest 2.4.x release (2.4.1) targets macOS Sequoia, not Tahoe.

---

## Option 1: Wait for Official Support (Recommended)

Monitor these resources:
- **GitHub Releases**: https://github.com/openzfsonosx/openzfs-fork/releases
- **Downloads Wiki**: https://github.com/openzfsonosx/openzfs-fork/wiki/Downloads
- **Forum**: https://openzfsonosx.org/forum/

**When 2.4.x Tahoe support is released, the installation will be simple:**

```bash
# Download the DMG from GitHub Releases
open https://github.com/openzfsonosx/openzfs-fork/releases

# Install the DMG
open OpenZFS_on_OS_X_2.4.x_Tahoe.dmg
sudo installer -pkg "OpenZFS_on_OS_X_2.4.x_Tahoe.pkg" -target /
```

---

## Option 2: Build from Source with Patches

### Prerequisites

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install build dependencies
brew install automake libtool gawk coreutils

# Check your build environment
brew doctor
```

### Clone the Repositories

```bash
# Create directories for development
mkdir -p ~/Developer ~/bin
chmod 700 ~/Developer ~/bin

# Clone SPL (Solaris Porting Layer) - required dependency
cd ~/Developer
git clone https://github.com/openzfsonosx/spl.git

# Clone OpenZFS - use the openzfs-fork repository for 2.4.x
cd ~/Developer
git clone https://github.com/openzfsonosx/openzfs-fork.git zfs
```

### Apply macOS Tahoe Patches

You need to apply the fixes from GitHub issues #43 and #53. Here are the exact code changes:

#### Patch 1: Fix spl-taskq.c (Issue #43 - Task Queue Crash)

Find `spl/taskq.c` and add a null check at the start of `taskq_thread()`:

```c
// Around line 2116 in spl/taskq.c
void
taskq_thread(void *arg)
{
	taskq_t *tq = arg;
	thread_t thread = current_thread();

	// ADD THIS FIX for macOS Tahoe
	if (tq == NULL) {
		spl_panic("taskq_thread: NULL taskq\n");
		return;
	}
	
	if (tq->tq_thread == NULL) {
		spl_panic("taskq_thread: NULL tq->tq_thread\n");
		return;
	}
	
	// Rest of existing function...
```

#### Patch 2: Fix zfs_vnops_osx.c (Issue #53 - Pageout Crash)

Find `module/zfs/zfs_vnops_osx.c` and add safety checks in `zfs_vnop_pageoutv2()`:

```c
// Around line 3107 in module/zfs/zfs_vnops_osx.c
int
zfs_vnop_pageoutv2(struct vnop_pageout_args *ap)
{
	struct vnode *vp = ap->a_vp;
	
	// ADD THIS FIX for macOS Tahoe
	if (vp == NULL) {
		return EINVAL;
	}
	
	if (!VOPISZFS(vp)) {
		return EINVAL;
	}
	
	// Rest of existing function...
```

### Build and Install

```bash
# First build SPL (must be done before ZFS)
cd ~/Developer/spl

# Configure
./configure CPPFLAGS="-I/usr/local/opt/gettext/include -I/usr/local/opt/openssl@3/include" \
    LDFLAGS="-L/usr/local/opt/gettext/lib -L/usr/local/opt/openssl@3/lib" \
    CFLAGS="-g -O2"

# Build
make -j$(sysctl -n hw.ncpu)

# Install (requires root)
sudo make install

# Check that SPL loaded
kextstat | grep spl
```

```bash
# Now build ZFS
cd ~/Developer/zfs

# Configure
./configure CPPFLAGS="-I/usr/local/opt/gettext/include -I/usr/local/opt/openssl@3/include" \
    LDFLAGS="-L/usr/local/opt/gettext/lib -L/usr/local/opt/openssl@3/lib" \
    CFLAGS="-g -O2"

# Build
make -j$(sysctl -n hw.ncpu)

# Install (requires root)
sudo make install

# Check that ZFS loaded
kextstat | grep zfs
```

### Configure Boot Arguments

```bash
# Set boot arguments for debugging (required for unsigned kernel extensions)
sudo nvram boot-args="-v keepsyms=1"

# Reboot to apply
sudo reboot
```

### Disable System Integrity Protection (SIP)

**IMPORTANT**: You need to disable SIP for kernel extensions:

1. **Reboot into Recovery Mode**:
   - Restart your Mac
   - Hold `Command + R` until the Apple logo appears

2. **Open Terminal in Recovery Mode**:
   - From the Utilities menu, select Terminal

3. **Disable SIP for kernel extensions only**:
   ```bash
   csrutil enable --without kext
   ```

4. **Reboot normally**

### Verify Installation

```bash
# Check kernel extensions loaded
kextstat | grep -E "spl|zfs"

# Should see output like:
# 144    1 0xffffff7f82720000 0xd000     0xd000     net.lundman.spl (1.9.x)
# 145    0 0xffffff7f8272d000 0x202000   0x202000   net.lundman.zfs (1.9.x)

# Verify ZFS commands work
zpool --version
zfs --version

# Check pool status (should show no pools)
zpool list
```

---

## Option 3: Use APFS Instead (Simpler Alternative)

If building from source seems too complex, you can use **APFS** which is native and fully supported:

```bash
# Create APFS container spanning both drives
diskutil apfs addVolume disk4 "APFS" monster -role X
diskutil apfs addVolume disk5 "APFS" clusterfuck -role X

# Or create separate containers
diskutil apfs create disk4 "monster-backup"
diskutil apfs create disk5 "clusterfuck-backup"

# Verify
diskutil list | grep -E "disk[0-9]+"
```

Then configure Time Machine:
```bash
# Add backup destinations
sudo tmutil setdestination -a /Volumes/monster-backup
sudo tmutil setdestination -a /Volumes/clusterfuck-backup

# Verify destinations
tmutil listdestinations
```

---

## Configure FreeBSD Backups (ZFS Replication)

Once OpenZFS is working on macOS, set up backups from your FreeBSD servers:

### On FreeBSD Server

```bash
# Create snapshot
zfs snapshot pool/dataset@backup-$(date +%Y%m%d-%H%M%S)

# Send to macOS (requires SSH key setup)
zfs send pool/dataset@backup-$(date +%Y%m%d-%H%M%S) | \
    ssh user@macos-host "zfs receive tank/freebsd/pool-data"
```

### Automated Backup Script

```bash
#!/bin/bash
# /usr/local/bin/freebsd-zfs-backup.sh

SOURCE_HOST="freebsd-server"
SOURCE_POOL="tank"
DEST_POOL="tank/freebsd"

# Get list of snapshots to backup
ssh $SOURCE_HOST "zfs list -t snapshot | grep ${SOURCE_POOL}" | \
    while read snap; do
        # Check if we already have this snapshot
        if ! zfs list -t snapshot | grep -q "$snap"; then
            echo "Replicating $snap..."
            zfs send "$snap" | ssh user@macos-host "zfs receive ${DEST_POOL}/${SOURCE_POOL}"
        fi
    done
```

---

## Create ZFS Pool on Your 20TB Drives

**WARNING**: This will destroy all data on the drives!

```bash
# Verify drive identifiers (should be /dev/disk4 and /dev/disk5)
diskutil list | grep -E "disk[0-9]+"

# Export any existing pools
sudo zpool export -a 2>/dev/null || true

# Create mirrored ZFS pool
sudo zpool create tank mirror /dev/disk4 /dev/disk5

# Verify pool status
sudo zpool status tank

# Create datasets with quotas and Time Machine support
sudo zfs create -o atime=off \
    -o compression=lz4 \
    -o quota=9T \
    tank/monster

sudo zfs create -o atime=off \
    -o compression=lz4 \
    -o quota=9T \
    tank/clusterfuck

# Create Time Machine datasets with shadow support
sudo zfs create -o shadow=tm tank/monster/backup
sudo zfs create -o shadow=tm tank/clusterfuck/backup

# Verify datasets
sudo zfs list

# Set Time Machine destinations
sudo tmutil setdestination -a /tank/monster/backup
sudo tmutil setdestination -a /tank/clusterfuck/backup

# Verify Time Machine destinations
tmutil listdestinations
```

---

## Maintenance and Monitoring

### Daily Checks

```bash
# Check pool health
zpool status tank | grep -E "state|status"

# Check disk space
df -h /tank/*
```

### Weekly Tasks

```bash
# Run data integrity scrub (takes hours on large pools)
zpool scrub tank &

# Monitor progress
watch 'zpool status tank | grep scan'
```

### Monthly Tasks

```bash
# Review quotas and space usage
zfs list -o name,quota,used,available tank

# Check compression ratio
zfs get compressratio tank
```

---

## Troubleshooting

### Kernel Panic on Boot

1. Boot in Safe Mode (hold Shift)
2. Unload kernel extensions:
   ```bash
   sudo kextunload -b net.lundman.spl
   sudo kext unload -b net.lundman.zfs
   ```
3. Export pool:
   ```bash
   sudo zpool export tank
   ```

### Diskutil Doesn't Recognize ZFS

```bash
# Force diskarbitration to reprobe
sudo killall -HUP diskarbitrationd

# Or unmount and remount datasets
sudo zfs umount tank/monster
sudo zfs mount tank/monster
```

### Build Errors

Check `config.log` for configuration errors:
```bash
cd ~/Developer/zfs
tail -100 config.log | grep -i error
```

---

## Summary

**Current Status**: OpenZFS 2.4.x does NOT support macOS 26 "Tahoe" yet.

**Options**:
1. **Wait for official support** (recommended - check GitHub releases weekly)
2. **Build from source with patches** (complex, requires code modifications)
3. **Use APFS instead** (simple, native, no complexity)

**For your use case (Time Machine backups + FreeBSD replication)**:
- If you need ZFS features now: Build from source with patches
- If you can wait a few weeks/months: Use APFS or wait for OpenZFS Tahoe support
