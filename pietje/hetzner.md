# Hetzner Server Documentation for pietje

**Quick Reference:**
- **Server**: pietje.rop.nl - Hetzner EX42 dedicated server
- **OS**: FreeBSD 14.3-RELEASE-p2
- **Console Access Status**: NOT WORKING - Hetzner vKWM port 47773 refused, physical KVM needed
- **Last Recovery Date**: Mon Oct 19 2026

**IMPORTANT:** FreeBSD upgrades require out-of-band console access. See `pietje.md` for upgrade procedures and check here for Hetzner-specific information.

---

## Current Status (As of Mon Oct 19 2026)

### Where We Are
- **Server**: Hetzner EX42 dedicated server (pietje.rop.nl)
- **OS**: FreeBSD 14.3-RELEASE-p2
- **Situation**: Successfully recovered after failed upgrade attempt to 14.5
- **SSH Access**: WORKING (recovered via ZFS snapshot rollback)
- **Recovery Status**: Completed - server restored from pre-upgrade snapshot

### What Happened
1. Started staged upgrade (`freebsd-update -r 14.5-RELEASE upgrade`)
2. Staged files downloaded but `freebsd-update install` couldn't run (needs TTY)
3. Attempted to reboot - system hung during boot
4. Reset via Hetzner Robot, booted Linux rescue
5. **Critical discovery**: Server was NOT rolled back - current dataset still had upgrade state
6. Ran `zfs rollback rpool/ROOT/FreeBSD@pre-upgrade-20261018`
7. Exported pool and rebooted
8. Server booted FreeBSD 14.3 successfully

### What We Learned
1. **freebsd-update requires TTY** - staged upgrade alone doesn't break boot; incomplete `install` phase does
2. **ZFS rollback is mandatory** - if you stage an upgrade and want to go back, you MUST run rollback
3. **Rescue system is Linux** - the rescue kernel has nothing to do with your FreeBSD installation
4. **ZFS pools survive reboots** - export/import is safe and preserves all data
5. **Bootfs property determines boot target** - ensure it points to the correct dataset

### Recovery Commands Used
```bash
# Import ZFS pool from rescue system
zpool import rpool

# List datasets to verify state
zfs list -r rpool/ROOT

# Check bootfs property
zpool get bootfs rpool

# Export pool cleanly before reboot
zpool export rpool

# If rollback needed:
zfs rollback rpool/ROOT/FreeBSD@pre-upgrade-20261018
```

---

## Hetzner Rescue System Options

When you select an option in the Robot → Rescue tab, here's what you get:

### 1. Linux (Standard)
- Boots minimal Debian Linux rescue system
- SSH available on port 22 as root
- **This is what you want** for recovery operations
- Uses PXE boot - stateless, no changes persist

### 2. Linux (old)
- Older Debian version
- Same functionality as "Linux" but with older kernel

### 3. Linux (Trixie/beta)
- Debian 13 beta
- Same functionality as "Linux" but with newer (beta) kernel

### 4. vKVM (Bookworm)
- **WARNING**: This is NOT console access to your FreeBSD
- Boots Linux Bookworm in a VM, then presents web-based vKWM console
- SSH available on port 47772 with password from Robot
- **Does NOT boot your FreeBSD disk** - this is a separate Linux VM

### 5. vKVM (Trixie/beta)
- Same as above but with Debian 13 beta
- **Does NOT boot your FreeBSD disk**

### Important: Understanding vKVM vs Rescue

**Hetzner's "vKWM" options are NOT console access to your FreeBSD.**

The vKVM options (Bookworm/Trixie) are just Linux rescue images with web-based console access. They do NOT boot your FreeBSD installation.

**To get actual console access to your FreeBSD, you need:**
1. Physical KVM console from Hetzner support (paid service)
2. Or serial console access configured in your FreeBSD

**The rescue system is a completely separate Linux environment:**
- Boots via PXE (stateless - no changes persist)
- Has its own kernel (`/boot/vmlinuz`), initramfs, and root filesystem
- Your FreeBSD datasets are mounted under `/mnt/freebsd` or similar paths when you import the pool
- OpenZFS must be compiled/installled to access FreeBSD ZFS pools

---

## Hetzner's Free Console Access

### VNC Through QEMU (From Linux Rescue)

The proper way to get FreeBSD console access:

1. **Boot Linux rescue** (select "Linux" in Robot)
2. Use QEMU to boot your FreeBSD disk:
```bash
qemu-system-x86_64 -net nic -net user,hostfwd=tcp::2222-:22 \
  -m 4096M -enable-kvm -cpu host,+nx -M pc -smp 2 \
  -device virtio-scsi-pci,id=scsi0 \
  -drive file=/dev/nvme0n1,if=none,format=raw,discard=unmap,aio=native,cache=none,id=n0 \
  -device scsi-hd,drive=n0,bus=scsi0.0 \
  -boot once=d
```

3. SSH tunnel for console access:
```bash
ssh -N -L 5904:localhost:5900 root@pietje.rop.nl
```

4. Connect to localhost:5904 with VNC client

---

## Hetzner's Broken Console Access

### vKWM Web Console
- **URL**: https://65.109.148.215:47773/
- **Status**: Port 47773 is REFUSED
- **Problem**: Hetzner vKWM is not working for this server
- **Status Page**: https://docs.hetzner.com/robot/dedicated-server/virtualization/vkvm/

### Physical KVM Console
- **Status**: Requires support request
- **Cost**: Usually free for a limited time (3 hours)
- **How to Request**: Robot → Support tab → "Remote Console"
- **Alternative**: Some servers get KVM automatically when vKWM fails

---

## FreeBSD Upgrade Limitations on Hetzner

### The Problem
FreeBSD's `freebsd-update` upgrade process requires:
1. Interactive TTY for file merge confirmation during `upgrade`
2. Interactive TTY for `install` phase (post-reboot)

### Why Hetzner Doesn't Work
- **vKWM**: Web console shows Linux rescue, not FreeBSD disk boot
- **Physical KVM**: Required but not available by default
- **Serial console**: Not configured in FreeBSD

### The Root Issue
Your EX42 server uses:
- **Traditional base layout** (not pkgbase)
- `/usr/bin/uname` compiled into kernel
- `freebsd-update` required for upgrades (not pkg)
- `freebsd-update install` needs interactive TTY

### Safe Upgrade Options
1. **Stay on 14.3** - Still supported and receiving security updates
2. **Request physical KVM from Hetzner** - Then upgrade with console access
3. **pkgbase migration** - Long-term solution (FreeBSD 16+ uses pkgbase)

---

## Hetzner EX42 Server Specifications

| Component | Specification |
|-----------|---------------|
| **Model** | EX42 |
| **CPU** | Intel Core i5/i7 (varies by batch) |
| **RAM** | 64GB DDR4 Non-ECC (fixed, cannot upgrade) |
| **Storage** | 2x NVMe or SATA SSD options |
| **Network** | Gigabit Ethernet (igb0) |

---

## Recovery if Server Bricks

### Option 1: Reset via Robot
1. Robot → Server → Reset tab
2. "Hardware reset" or "Automatic hardware reset"

### Option 2: Boot from Rescue
1. Robot → Server → Rescue tab
2. Select "Linux" (NOT vKVM)
3. Activate and reboot

### Option 3: Physical KVM from Hetzner
Contact support for physical console access to fix boot issues.

---

## SSH Access and Known Hosts Management

**The rescue system has a different SSH key than FreeBSD.** When recovering, use `ssh-keygen -R pietje.rop.nl` before connecting to FreeBSD (to remove the temporary rescue key), then connect with `ssh root@pietje.rop.nl` (without strict checking) to add the correct FreeBSD key to known_hosts.

---

## Quick Reference

| Action | How To |
|--------|--------|
| SSH after FreeBSD is running | `ssh root@pietje.rop.nl` |
| SSH to vKWM | `ssh root@pietje.rop.nl -p 47772` (with password) |
| vKWM web console | https://65.109.148.215:47773/ (NOT WORKING) |
| Physical KVM | Request from Hetzner support |

---

## Recovery Checklist (If Server Won't Boot)

### Step 1: Reset via Robot
- Robot → Server → Reset tab
- "Hardware reset" to reboot

### Step 2: Boot to Rescue (if still stuck)
1. Robot → Server → Rescue tab
2. Select "Linux" (NOT vKVM)
3. Activate and reboot

### Step 3: Access Rescue System
```bash
# First time (rescue SSH key will differ)
ssh -o StrictHostKeyChecking=no root@pietje.rop.nl

# Or update known_hosts
ssh-keygen -R pietje.rop.nl
```

### Step 4: Import ZFS Pool
```bash
# Import the pool (OpenZFS will be compiled if needed)
zpool import rpool

# Check health
zpool status rpool

# Verify datasets exist
zfs list -r rpool/ROOT
```

### Step 5: Check Boot Configuration
```bash
# Verify bootfs points to correct dataset
zpool get bootfs rpool

# Should show: bootfs    rpool/ROOT/FreeBSD
```

### Step 6: Determine If Rollback Is Needed
```bash
# List snapshots to see recovery points
zfs list -t snapshot rpool

# Compare current dataset with snapshot (if mounted)
zfs clone rpool/ROOT/FreeBSD@pre-upgrade-20261018 rpool/compare
zfs set mountpoint=/mnt/check rpool/compare
zfs mount rpool/compare

# Check if kernel matches expected version
strings /mnt/check/boot/kernel/kernel | grep "FreeBSD"
```

### Step 7: Rollback If Needed
```bash
# THIS WILL OVERWRITE CURRENT CHANGES
zfs rollback rpool/ROOT/FreeBSD@pre-upgrade-20261018

# Verify rollback
zfs list -r rpool/ROOT
```

### Step 8: Export and Reboot
```bash
# Clean export
zpool export rpool

# Import again (to verify)
zpool import rpool

# Reboot to FreeBSD
reboot
```

### Step 9: Verify Recovery
```bash
# After reboot, connect normally
ssh root@pietje.rop.nl

# Verify FreeBSD version
uname -a

# Check jails
jls

# Verify services
service sshd status
```

---

## Notes
- **vKWM is NOT FreeBSD** - it's a Linux rescue VM with web console
- Hetzner has silently dropped FreeBSD rescue support
- Physical KVM is required for safe FreeBSD upgrades on this server
- The rescue system is stateless - no changes persist after reboot
- Always verify rollback was successful before exporting pool and rebooting
- SSH host key will differ between rescue (temporary) and FreeBSD (persistent)
