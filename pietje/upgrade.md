# FreeBSD 14.3 → 14.5 Upgrade Documentation for pietje

**Last Updated**: Sun Oct 18 2026  
**Current Status**: Server stuck during boot - recovery in progress  
**Server**: pietje.rop.nl (Hetzner EX42)

---

## Quick Status

- **Target Version**: FreeBSD 14.5-RELEASE (Legacy Release - extended support)
- **Current Status**: Stuck during boot after failed upgrade attempt
- **SSH Access**: Lost during upgrade process, recovery attempted via reset
- **Console Access**: NOT WORKING - Hetzner vKWM port 47773 refused

---

## Why This Upgrade Failed

### The Core Problem

FreeBSD's `freebsd-update` upgrade process requires:
1. **Interactive TTY for file merge confirmation** during `upgrade`
2. **Interactive TTY for `install` phase** (post-reboot)

### Why Hetzner vKWM Doesn't Work

- **vKWM web console** (https://65.109.148.215:47773/) - Port 47773 refused
- **Hetzner's vKWM is NOT FreeBSD console** - it's a Linux rescue VM
- **Physical KVM required** but not available by default

### What We Tried

1. Started staged upgrade (`freebsd-update -r 14.5-RELEASE upgrade`)
2. Staged files downloaded but `freebsd-update install` couldn't run (needs TTY)
3. Hetzner vKWM didn't work (port 47773 refused)
4. Installed TigerVNC client for QEMU VNC access
5. Booted FreeBSD via QEMU from Linux rescue system
6. System froze during boot, waiting for keyboard input
7. Server reset to attempt recovery

---

## Hetzner Rescue Options (5 Types)

| Option | Description | SSH Port |
|--------|-------------|----------|
| **1. Linux (Standard)** | Minimal Debian rescue system | 22 |
| **2. Linux (old)** | Older Debian version | 22 |
| **3. Linux (Trixie/beta)** | Debian 13 beta | 22 |
| **4. vKVM (Bookworm)** | Linux Bookworm VM with web console | 47772 |
| **5. vKVM (Trixie/beta)** | Linux Trixie VM with web console | 47772 |

### Important: Understanding vKVM

**Hetzner's "vKWM" options are NOT console access to your FreeBSD.**

The vKWM options (Bookworm/Trixie) are just Linux rescue images with web-based console access. They do NOT boot your FreeBSD installation.

**To get actual console access to your FreeBSD, you need:**
1. Physical KVM console from Hetzner support (paid service)
2. Or serial console access configured in your FreeBSD

---

## The Upgrade Procedure (When Console Access Is Available)

### Prerequisites Checklist

**Console Access Verification (CRITICAL):**
- [ ] SSH access to host (`ssh root@pietje.rop.nl`)
- [ ] Jail console to ns0 (`con ns0`)
- [ ] Jail console to unbound (`con unbound`)
- [ ] Jail console to mail (`con mail`)
- [ ] **Out-of-band console access** (physical KVM or Hetzner rescue)

### Step-by-Step Upgrade

```bash
# 1. Backup everything first
zfs snapshot -r rpool@pre-upgrade

# 2. Verify packages are up to date (while on 14.3)
pkg update && pkg upgrade

# 3. Update to FreeBSD 14.5 via freebsd-update
freebsd-update -r 14.5-RELEASE upgrade

# This will:
# - Fetch the new release
# - Apply binary patches to update kernel and base
# - Show you what's going to change

# 4. After freebsd-update completes, reboot into new kernel
reboot

# 5. Complete the upgrade (post-reboot)
freebsd-update install

# 6. Update all packages to match the new FreeBSD version
pkg update && pkg upgrade

# 7. Verify system
uname -a
freebsd-version
pkg info | head -20

# 8. Verify all jails are still accessible and functional
ezjail-admin list
con admin
```

### Post-Upgrade Checklist

- [ ] `uname -a` shows FreeBSD 14.5-RELEASE
- [ ] `freebsd-version` shows correct version for kernel and userland
- [ ] All jails start successfully: `ezjail-admin list`
- [ ] Post-upgrade package upgrade completed: `pkg update && pkg upgrade -f`
- [ ] DNS services verified (nsd-control status, unbound-control status)
- [ ] Mail services verified (postfix status, dovecot status)
- [ ] Database accessible (MySQL)

---

## DNS/Mail Service Upgrade Analysis

### Version Changes (14.3 → 14.5)

| Package | Current | Target | ABI/Config Impact |
|---------|---------|--------|-------------------|
| bind-tools | 9.20.16 | 9.20.29 | Low - tools only |
| unbound | 1.23.1 (pkg) / 1.24.1 (base) | 1.26.0 (base) | Medium - check unbound.conf |
| nsd | 4.13.0 | 4.13.0 (likely) | None - same version |
| postfix | 3.10.x | 3.10.4 (likely) | Low - quarterly branch stability |
| dovecot | 2.3.x | 2.3.21.1_3 | Low - patch version |
| openssl | 3.0.x | 3.0.21 (base) | Medium - TLS config compatible |

### Critical Dependencies

**High Priority:**
1. MySQL client ABI compatibility (Postfix + Dovecot)
2. OpenSSL library compatibility
3. Unbound configuration

**Pre-check:** Run `pkg check -s all` before upgrade

### Service Dependency Analysis

| Service | Dependencies | Risk |
|---------|--------------|------|
| NSD | libc, libuv, protobuf-c | Low |
| Unbound | libc, libevent, libuv, ldns, Nettle | Medium |
| Postfix | libc, openssl, cyrus-sasl, MySQL client | Medium-High |
| Dovecot | libc, openssl, MySQL client | Medium-High |
| OpenDKIM | libc, openssl | Low |

---

## Rollback Plan (If Needed)

```bash
# If something breaks badly:
1. Reboot - system should offer menu to select kernel version
2. If that fails, restore ZFS snapshot: zfs rollback -r rpool@pre-upgrade
```

### Rollback Readiness Check

- [ ] ZFS snapshot created: `zfs list | grep pre-upgrade`
- [ ] Verify snapshot size is reasonable (should be small)
- [ ] Document rollback procedure (this document)

### Quick Recovery

```bash
# Import pool if needed
zpool import rpool

# List available snapshots
zfs list -t snapshot rpool

# Rollback to pre-upgrade snapshot
zfs rollback -r rpool@pre-upgrade
```

---

## Server Recovery if Stuck

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

## Server Information

| Component | Specification |
|-----------|---------------|
| **Model** | Hetzner EX42 |
| **CPU** | Intel Core i5/i7 |
| **RAM** | 64GB DDR4 Non-ECC (fixed) |
| **Storage** | 2x NVMe or SATA SSD |
| **Network** | Gigabit Ethernet (igb0) |

### Network Configuration

- **Primary**: 65.109.148.215/26 (pietje.rop.nl)
- **Mail**: 65.109.148.206/32 (mail.rop.nl)
- **Gateway**: 65.109.148.193
- **IPv6**: 2a01:4f9:3100:4b60::1/64

### Storage (ZFS)

- **Pool**: rpool (460GB total)
- **Available Space**: ~208GB
- **Datasets**:
  - rpool/bhyve (25.2GB) - Docker VM
  - rpool/ezjail (96GB) - All jails
  - rpool/vmail (112GB) - Email storage

---

## Contact and Emergency

### Console Access Status
- Hetzner vKWM web console: NOT WORKING (port 47773 refused)
- Physical KVM: Requires support request

### Safe Options
1. **Stay on 14.3** - Still supported and receiving security updates
2. **Request physical KVM from Hetzner** - Then upgrade with console access
3. **pkgbase migration** - Long-term solution (FreeBSD 16+ uses pkgbase)

### Recommendation
Do not proceed with the upgrade until you have confirmed console access is available.

---

*See `hetzner.md` for full Hetzner-specific information and recovery procedures.*
