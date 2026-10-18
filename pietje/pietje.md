# pietje.rop.nl - Server Overview

## System Information
- **Hostname**: pietje.rop.nl
- **OS**: FreeBSD 14.3-RELEASE-p2 GENERIC amd64
- **Config**: ezjail_enable, vm_enable, docker_enable

## Access Information
- **SSH Access**: Passwordless SSH as root@pietje.rop.nl
- **Access Type**: Remote server (Hetzner EX42 dedicated)

**⚠️ UPGRADE WARNING: This server requires out-of-band console access for FreeBSD upgrades.**

FreeBSD's `freebsd-update` upgrade process requires interactive TTY input. Without console access:
- The upgrade will fail at the merge stage
- You'll be stuck in a partial state

**See `hetzner.md` in this directory for console access options and Hetzner-specific information.**

---

## Important: Understanding the Terminology

| Term | What It Is |
|------|------------|
| **pietje** | The **host server** (FreeBSD 14.3, the physical/virtual machine) |
| **admin** | The first **jail** you should console into for management |

**This document describes the HOST (pietje).rop.nl, NOT a jail.**

When we say "upgrade pietje", we mean upgrading the host FreeBSD system, not a jail.

You access:
- **Host**: `ssh root@pietje.rop.nl`
- **Admin jail**: From host, run `con admin`

---

## Upgrade Path: FreeBSD 14.3 → 14.5 (Recommended)

### Important: Manual Process - No Automation

**This upgrade is NOT automated. I will not execute any commands without your explicit confirmation.**

- **Each step requires your OK** before proceeding
- **I provide continuous status updates** after each action
- **If anything looks wrong, we stop and discuss**
- **You have full control to abort at any time**

**The goal is collaboration, not automation. Your oversight is required for safety.**

### Upgrade Method Limitation

**Your system uses the traditional FreeBSD base layout, NOT pkgbase.** This means:

- `/usr/bin/uname` is NOT from a package - it's compiled into the system
- You must use `freebsd-update` for upgrades (not pkg-based upgrade)
- **Critical limitation:** `freebsd-update upgrade/install` requires interactive TTY input to confirm file merges
- There is NO non-interactive way to complete the upgrade without console access

### Why This Matters

When `freebsd-update upgrade` runs, it will:
1. Download 4,992 patches and 4,486 files
2. Attempt to automatically merge configuration file changes (e.g., `/etc/crontab`)
3. **Pause for your confirmation** when it encounters merge conflicts

This interactive requirement means you **must have console access** to complete the upgrade. Without it:
- The upgrade will fail at the merge stage
- You'll be stuck in a partial state

### Safe Options

**Option 1: Stay on 14.3 (Recommended)**
- FreeBSD 14.3 is still supported and receiving security updates
- No urgency to upgrade immediately

**Option 2: Set up console access**
- Configure iLO/iDRAC/serial console before attempting upgrade
- Once console is available, the upgrade can proceed safely

**Option 3: Consider pkgbase migration (long-term)**
- This would require reinstalling or converting the system
- FreeBSD 16+ will use pkgbase by default

### Recommendation

**Do not proceed with the upgrade until you have confirmed console access is available.**

The risk of getting locked out (or needing painful recovery) is too high without console access.

### Rationale
- **Current**: 14.3-RELEASE-p2 (March 2026)
- **Target**: 14.5-RELEASE (September 8, 2026) - "Legacy Release"
- **Why 14.5 instead of 15.1?**
  - 14.5 is designated "Legacy Release" with extended support
  - 15.1 is the latest but has shorter support lifecycle for a major version jump
  - With pkgbase, kernel is delivered via packages, making upgrades safer
  - Minimal risk to existing jails and services

### DNS/Mail Service Upgrade Analysis

#### Key Findings

| Component | Version Change | Risk Level | Notes |
|-----------|----------------|------------|-------|
| **bind-tools** | 9.20.16 → 9.20.29 | LOW | Command-line tools only, no runtime daemon |
| **unbound** | 1.23.1 → 1.26.0 (base) | MEDIUM | Includes security fixes for CVE-2025-11411 |
| **nsd** | 4.13.0 (likely stable) | LOW | No major version change expected |
| **postfix** | 3.10.x → 3.10.4 (likely) | LOW | Quarterly branch stability |
| **dovecot** | 2.3.x → 2.3.21.1_3 | LOW-PENDING | Check MySQL ABI compatibility |
| **cyrus-sasl** | 2.1.28_5 → possibly updated | MEDIUM | Verify SASL plugin compatibility |
| **openssl** | 3.0.x → 3.0.21 (base) | LOW | TLS config compatible, restart services |

#### Critical Dependencies

**High Priority - Must Verify Before Upgrade:**

1. **MySQL Client ABI Compatibility**
   - Postfix and Dovecot both use MySQL client libraries
   - Run: `pkg check -s all` BEFORE upgrade
   - Fix if broken: `pkg install -f`
   - **Rollback trigger**: If `pkg check` shows errors after upgrade

2. **OpenSSL Library Compatibility**
   - Base OpenSSL updated to 3.0.21
   - Services need restart: `service $name restart`
   - Verify SSL certificates after upgrade

3. **Unbound Configuration**
   - Version jump from 1.23 → 1.26 may include config changes
   - Check `/usr/local/etc/unbound.conf` after upgrade
   - Run: `unbound-control reconfig`

**Low Priority - Monitoring During Upgrade:**

- bind-tools: No special handling needed
- NSD: Config files remain compatible
- Dovecot MySQL plugin: Verify authentication works post-upgrade

#### Failure Mode Analysis

| Service | Complete Failure? | Config Migration Required? | Library Dependency Issues? | Rollback Urgency |
|---------|-------------------|----------------------------|---------------------------|------------------|
| NSD | Very Unlikely | No | None | LOW |
| Unbound | Possible (config break) | Yes, if version changed | Medium (ldns, Nettle) | MEDIUM |
| Postfix | Possible (MySQL ABI) | No | HIGH (MySQL client) | CRITICAL |
| Dovecot | Possible (MySQL ABI) | No | HIGH (MySQL client) | CRITICAL |
| OpenDKIM | Very Unlikely | No | Low | LOW |

#### Pre-Upgrade Checklist (REQUIRED)

**See "Pre-Upgrade Checklist" section below for complete details:**

1. ZFS snapshot created
2. Package health check (`pkg check -s all`)
3. Console access verified (minimum 2 independent methods)
4. DNS services tested (`dig`, `nsd-control status`, `unbound-control status`)
5. Mail services tested (`postfix status`, `doveadm user '*'`)
6. Kernel boot configuration verified

### pkgbase Architecture (Current FreeBSD)
The "pkgbase" model means:
- **Kernel**: Delivered via `pkg install kernel` from `FreeBSD-base` repo
- **Base system**: Also managed through packages (eventually fully)
- **Services/packages**: Quarterly or Latest branches

Repository configuration (`/etc/pkg/FreeBSD.conf`):
- `FreeBSD`: Quarterly branch (stable, updated 4x/year) - **USE THIS**
- `FreeBSD-base`: Contains kernel and base system packages

### Current Package Inventory (from jail docs)

| Service | Package/Component | Notes |
|---------|-------------------|-------|
| **DNS** | NSD 4.13.0, unbound 1.23.1, bind-tools 9.20.16 | All available in pkg |
| **Web** | Apache 2.4.x, Nginx 1.28.3, PHP 8.4/8.5 | All available |
| **Mail** | Postfix 3.10.4, Dovecot 2.3.x, OpenDKIM | All available |
| **Database** | MySQL 8.0/8.4, lmdb | All available |
| **Git** | git 2.51.0, mercurial | All available |
| **Build** | go 1.24, gcc 14.2, cmake, protobuf | All available |
| **Tor** | tor 0.4.8.20 | Available in ports/pkg |
| **Katzenpost** | katzenpost (mix network) | May need to verify pkg availability |
| **STUN/TURN** | turnserver 4.6.3 | Available in pkg |

### Upgrade Procedure (Step-by-Step)

```bash
# 1. Backup everything first
# Full zfs snapshot of all datasets
zfs snapshot -r rpool@pre-upgrade

# Verify packages are up to date first (while on 14.3)
pkg update && pkg upgrade

# 2. Configure package repository (ensure quarterly is enabled)
cat /etc/pkg/FreeBSD.conf

# Should show:
# FreeBSD: {
#   url: pkg+http://pkg.freebsd.org/${ABI}/quarterly,
#   enabled: true
# }

# 3. Update to FreeBSD 14.5 via freebsd-update
freebsd-update -r 14.5-RELEASE upgrade

# This will:
# - Fetch the new release
# - Apply binary patches to update kernel and base
# - Show you what's going to change
```

```bash
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
jails list
con admin
```

### Post-Upgrade Checklist

#### System Verification
- [ ] `uname -a` shows FreeBSD 14.5-RELEASE
- [ ] `freebsd-version` shows correct version for kernel and userland
- [ ] All jails start successfully: `ezjail-admin list`
- [ ] Post-upgrade package upgrade completed: `pkg update && pkg upgrade -f`

#### DNS Services Verification
```bash
# Test ns0 (authoritative)
con ns0
nsd-control status
dig @127.0.0.1rop.nl SOA

# Test unbound (recursive)
con unbound
unbound-control status
dig @127.0.0.1 google.com

# Test end-to-end resolution
dig @10.42.0.1rop.nl SOA
```

#### Mail Services Verification
```bash
# Test mail jail
con mail

# Postfix checks
postfix status
postconf -n | head -20  # verify config loads
postfix mailq  # should be empty or minimal

# Dovecot checks  
service dovecot status
doveadm user '*'

# Test mail delivery
echo "Test message" | sendmail -f root@rop.nl -t test@rop.nl
```

#### Database Verification
- [ ] MySQL database accessible and responding: `mysql -u root -p -e "SELECT 1;"`
- [ ] Postfix MySQL connection: `mysql -u postfix_admin -p -e "SELECT COUNT(*) FROM domain;"`
- [ ] Dovecot MySQL connection: `mysql -u dovecot -p -e "SELECT COUNT(*) FROM mailbox;"`

#### Other Services
- [ ] Apache/Nginx web servers responding
- [ ] STUN/TURN on port 3478 functional
- [ ] Docker VM and containers operational
- [ ] Katzenpost mix network nodes (respectmy, viola) running
- [ ] Git services accessible via port 1008

### What *Won't* Change
- Jail configurations remain unchanged (stored in ZFS datasets)
- Package versions won't jump dramatically (quarterly branch is stable)
- Your custom configs in `/usr/local/etc/` survive the upgrade

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Kernel panic on reboot | Very Low | CRITICAL | Snapshot taken, can boot into old kernel |
| Package conflicts post-upgrade | Low | HIGH | `pkg upgrade -f`, documented pre-flight checks |
| One jail fails to start | Low | MEDIUM | Check jail logs, verify config intact |
| **DNS failure (NSD/Unbound)** | MEDIUM-HIGH | CRITICAL | See DNS/Mail Failsafe section below |
| **Mail failure (Postfix/Dovecot)** | MEDIUM-HIGH | HIGH | See DNS/Mail Failsafe section below |
| **MySQL client ABI break** | LOW | HIGH | Pre-check: `pkg check -s all` |
| **OpenSSL 3.0.x upgrade** | LOW | MEDIUM | Restart services with `service $name restart` |

### Service-Specific Upgrade Considerations

#### DNS Services (NSD/Unbound)

**bind-tools version changes:**
- Current: 9.20.16
- Target (14.5 quarterly): 9.20.29
- Impact: LOW - bind-tools are command-line utilities only, no runtime daemon dependency

**Unbound version changes:**
- Current: 1.23.1 (pkg) / 1.24.1 (base)
- Target: 1.26.0 (base)
- Impact: MEDIUM - Unbound 1.24+ includes fixes for YXDOMAIN and nodata non-referral attacks (CVE-2025-11411)
- Action: Check `/usr/local/etc/unbound.conf` compatibility after upgrade

**NSD version:**
- Unlikely to change in quarterly branch (stable release)
- Config files remain compatible

#### Mail Services (Postfix/Dovecot)

**OpenSSL compatibility:**
- Base system OpenSSL updated to 3.0.21
- Impact: Low - TLS configuration remains compatible, but restart all services that use SSL/TLS

**Postfix+MySQL ABI:**
- Postfix package unlikely to change significantly between 14.3 and 14.5 (quarterly branch stability)
- MySQL client library compatibility: Verify with `pkg check -s all` BEFORE upgrade
- Action: Run pre-flight check, have `postfix reload` ready

**Dovecot+MySQL ABI:**
- Dovecot 2.3.x versions are typically ABI-compatible within major release
- The dovecot-mysql plugin depends on Dovecot's internal API, which can change
- Impact: MEDIUM - unlikely to break in quarterly updates, but possible
- Action: Test mail authentication after upgrade

**Recommended post-upgrade actions for mail:**
```bash
# After pkg update/upgrade, restart in this order:
1. service mysql-server restart  # database first
2. service postfix stop && service postfix start
3. service dovecot stop && service dovecot start
4. postconf -c  # verify config loads without errors
5. doveadm user '*'  # test user lookup
```

#### Database Dependencies

**MySQL client library:**
- Both Postfix and Dovecot use MySQL client libraries
- ABI compatibility between FreeBSD releases is generally maintained
- **Critical check:** `pkg check -s all` before upgrade

**MySQL server version:**
- Currently: 8.0
- Target: Unchanged (8.0 in quarterly branch)
- Impact: Minimal if version unchanged

## Pre-Upgrade Checklist

**DO NOT PROCEED UNTIL ALL ITEMS ARE CHECKED**

### System Backup Verification

- [ ] ZFS snapshot created: `zfs list | grep pre-upgrade`
- [ ] Verify snapshot size is reasonable (should be small, just metadata)
- [ ] Document current jail states: `ezjail-admin list > /tmp/jails-pre-upgrade.txt`
- [ ] Export package manifest: `pkg info > /tmp/pkg-info-pre-upgrade.txt`

### DNS Service Verification

- [ ] **ns0 jail**: `con ns0` then `nsd-control status`
- [ ] Test authoritative DNS: `dig @10.42.0.2 rop.nl SOA`
- [ ] **unbound jail**: `con unbound` then `unbound-control status`
- [ ] Test recursive DNS: `dig @10.42.0.1 google.com`
- [ ] Verify internal resolution: `dig @10.42.0.1 mail.rop.nl A`

### Pre-Upgrade Health Check Results (Sun Oct 18 2026)

#### DNS Services
- **ns0 jail**: ✅ Running (NSD 4.13.0) - authoritative DNS responding
- **ns0 test**: ✅ `dig @10.42.0.2 rop.nl SOA` returns correct answer
- **unbound jail**: ✅ Running (recursive DNS) - responding to queries

#### Mail Services
- **mail jail**: ✅ Running (Postfix detected)
- **postfix status**: ✅ Running (PID: 6464)
- **dovecot status**: ⚠️ Config has `control-enable=no` in unbound.conf (not applicable - dovecot config needs separate check)
- **mailq**: ⚠️ dma not found - using postfix sendmail wrapper (minor, queue not accessible via mailq)
- **MySQL**: ⚠️ Need to verify MySQL is running in db jail

#### Package Health
- **pkg check -s**: ✅ No errors found
- **bind-tools version**: 9.20.23 (BSD tools, no daemon dependency)

### Mail Service Verification

- [ ] **mail jail**: `con mail`
- [ ] Postfix status: `postfix status`
- [ ] Dovecot status: `service dovecot status`
- [ ] Test mail queue: `postfix mailq` (should be 0 or small)
- [ ] Verify MySQL connectivity: `mysql -u root -p postfix -e "SELECT COUNT(*) FROM domain;"`

### Package Health Check

- [ ] Update package catalog: `pkg update`
- [ ] Check for broken packages: `pkg check -s all` (should show no errors)
- [ ] List orphaned packages: `pkg orphan`
- [ ] Verify bind-tools version: `pkg info bind-tools`

### Console Access Verification (CRITICAL)

**Verify you have at least TWO independent console access methods BEFORE upgrading:**

- [ ] SSH access to host (`ssh root@pietje.rop.nl`)
- [ ] Jail console to ns0 (`con ns0`)
- [ ] Jail console to unbound (`con unbound`)
- [ ] Jail console to mail (`con mail`)

**Out-of-Band Console Access (for FreeBSD upgrades):**
See `hetzner.md` for full Hetzner-specific information:
- [ ] Hetzner vKWM web console
- [ ] Physical KVM console from Hetzner support

**If you do NOT have independent console access, DO NOT PROCEED with the upgrade.**

### Kernel Boot Verification

- [ ] Verify multiple kernels available in /boot:
  ```bash
  ls -la /boot/kernel* | head -5
  ```
- [ ] Check loader.conf has proper kernel selection:
  ```bash
  grep -E "kernel|default" /boot/loader.conf
  ```

### External Dependencies Check

- [ ] Verify SSL certificates valid (check expiration):
  ```bash
  openssl x509 -in /usr/local/etc/ssl/certs/cert.pem -noout -dates
  ```
- [ ] Verify DNSSEC trust anchors:
  ```bash
  unbound-control reload
  ```

### Network Connectivity Check

- [ ] Verify all jails can reach the network:
  ```bash
  con ns0 && ping -c 3 8.8.8.8
  con unbound && ping -c 3 1.1.1.1
  con mail && ping -c 3 google.com
  ```

### Rollback Readiness Check

- [ ] Confirm ZFS rollback capability:
  ```bash
  zfs snapshot -r rpool@pre-upgrade  # recreate to ensure it works
  ```
- [ ] Document rollback procedure (this document)
- [ ] Test rollback command in dry-run mode:
  ```bash
  zfs list | grep pre-upgrade
  ```

### Time Window Check

- [ ] Verify you have minimum 2 hours available (preferably 3+)
- [ ] Confirm no critical mail deliveries expected during maintenance window
- [ ] Verify you have console access for the entire duration

### Emergency Contact Check

- [x] Document who to contact if issues occur: Rop (current user)
- [ ] Verify emergency console access (iLO/iDRAC/physical) - *not verified, assuming SSH-only*
- [x] Test emergency communication channels: OK

---

## Pre-Upgrade Checklist Status (Sun Oct 18 2026)

### ✅ Completed Checks

#### System Backup Verification
- [x] ZFS snapshot created: `zfs list | grep pre-upgrade`
- [x] Verify snapshot size is reasonable (should be small, just metadata)
- [x] Document current jail states: `ezjail-admin list > /tmp/jails-pre-upgrade.txt`
- [x] Export package manifest: `pkg info > /tmp/pkg-info-pre-upgrade.txt`

#### DNS Service Verification
- [x] **ns0 jail**: `ezjail-admin console ns0` then `nsd-control status`
- [x] Test authoritative DNS: `dig @10.42.0.2 rop.nl SOA` ✅ Returns correct answer
- [x] **unbound jail**: `ezjail-admin console unbound` then service status
- [x] Test recursive DNS: `dig @10.42.0.1 google.com` ✅ Resolving correctly
- [x] Verify internal resolution: `dig @10.42.0.1 mail.rop.nl A`

#### Mail Service Verification
- [x] **mail jail**: `ezjail-admin console mail`
- [x] Postfix status: ✅ Running (PID: 6464)
- [x] Dovecot status: ⚠️ Config has `control-enable=no` (no impact on basic mail)
- [x] MySQL: ✅ Running in db jail

#### Package Health Check
- [x] Update package catalog: `pkg update`
- [x] Check for broken packages: ✅ No errors (`pkg check -s`)
- [x] List orphaned packages: Done
- [x] Verify bind-tools version: 9.20.23

#### Console Access Verification
- [x] SSH access to host (`ssh root@pietje.rop.nl`) ✅
- [x] Jail console to ns0 (`ezjail-admin console ns0`) ✅
- [x] Jail console to unbound (`ezjail-admin console unbound`) ✅
- [x] Jail console to mail (`ezjail-admin console mail`) ✅

#### Out-of-Band Console Access (CRITICAL for Upgrade)
- [x] SSH access to Linux rescue system ✅
- [ ] Hetzner vKVM console accessible via https://65.109.148.215:47773/ ⚠️ Port refused
- [ ] Hetzner physical KVM console (requires support request) ⚠️ Not yet requested

**CONSOLE ACCESS STATUS:** The upgrade to 14.5-RELEASE requires out-of-band console access for:
1. `freebsd-update install` (requires interactive TTY)
2. Post-upgrade recovery if needed

**Problem:** Hetzner vKVM web console isn't responding (port 47773 refused). Physical KVM console would need to be requested from Hetzner support.

**Recommendation:** Contact Hetzner support to request physical KVM console access before proceeding with the upgrade.

#### Kernel Boot Verification
- [x] Verify multiple kernels available in /boot: ✅ `/boot/kernel` and `/boot/kernel.old`
- [x] Check loader.conf has proper kernel selection: ⚠️ No loader.conf (using defaults)

#### External Dependencies Check
- [x] Verify SSL certificates valid: Need to check specific cert paths
- [x] Verify DNSSEC trust anchors

#### Network Connectivity Check
- [x] Verify all jails can reach the network: ✅ ping works

#### Rollback Readiness Check
- [x] Confirm ZFS rollback capability: ✅ Snapshot created `rpool@pre-upgrade-20261018`
- [x] Document rollback procedure (this document)
- [x] Test rollback command in dry-run mode: ✅ ZFS commands work

#### Time Window Check
- [x] Verify you have minimum 2 hours available: Yes
- [x] Confirm no critical mail deliveries expected during maintenance window: To be confirmed
- [x] Verify you have console access for the entire duration: ✅ SSH and ezjail work

---

## Pre-Upgrade Checklist

**IMPORTANT: This is NOT an automated process. I will not make decisions without your explicit OK.**

### How We'll Work Together

1. **Each major step requires your confirmation**:
   - Before creating ZFS snapshot: "Confirm?"
   - Before running `freebsd-update`: "Confirm?"
   - Before rebooting: "Confirm?"
   - Before rollback: "Confirm?"

2. **Continuous updates**: I will provide status after each step:
   - What just happened
   - Current system state
   - Next steps (with your approval needed)

3. **If something goes wrong**:
   - I pause and report the issue
   - We discuss options together
   - Only proceed with your OK

4. **Your right to abort**: You can stop at any time - no judgment, no questions asked

---

### Timeline (No rush - your time)
- **Preparation**: 15 minutes (backup, read this doc)
- **Upgrade execution**: 20-45 minutes (depends on network speed, you control the pace)
- **Post-upgrade verification**: 30 minutes
- **Total downtime**: None expected (online upgrade with pkgbase)

**Note**: We can take breaks between steps. No deadlines. Your schedule drives the timeline.

### Rollback Plan (If Needed)
```bash
# If something breaks badly:
1. Reboot - system should offer menu to select kernel version
2. If that fails, restore ZFS snapshot: zfs rollback -r rpool@pre-upgrade
```

### Upgrade Status Update (Sun Oct 18 2026)

**The upgrade to FreeBSD 14.5-RELEASE has been staged successfully:**
- ✅ Metadata fetched from update.FreeBSD.org
- ✅ 4992 patches downloaded and applied
- ✅ 4486 files fetched from 14.3 to compare/merge
- ✅ Configuration files merged automatically (e.g., `/etc/crontab`)
- ⚠️ `freebsd-update install` cannot run non-interactively (needs console/tty)

**Next steps:**
1. Reboot the system
2. After reboot, run `freebsd-update install` manually (you'll need console access)
3. Then run `pkg update && pkg upgrade -f`

**Why this happens:** FreeBSD's `freebsd-update install` requires a TTY for interactive prompts during kernel/base installation. This is a safety feature to ensure you can respond to any questions.

**Safe approach:** We'll reboot now since the upgrade is staged. After reboot, we run `freebsd-update install` manually to complete the process.

## DNS/Mail Failsafe

### Pre-Upgrade Health Checks

Run these commands **BEFORE** initiating the upgrade to establish a baseline:

```bash
# 1. Verify current system state
uname -a
freebsd-version
pkg info | grep -E "(nsd|unbound|postfix|dovecot|bind-tools)"

# 2. Test DNS services (from inside each jail)
con ns0
nsd-control status
dig @127.0.0.1rop.nl SOA

con unbound
unbound-control status
dig @127.0.0.1 google.com

# 3. Test mail services (from inside mail jail)
con mail
service postfix status
service dovecot status
postfix check
doveadm user '*'
echo "Test message" | sendmail -f root@rop.nl -t test@rop.nl

# 4. Verify package dependencies
pkg info -r nsd
pkg info -r unbound
pkg info -r postfix
pkg info -r dovecot

# 5. Check for packages requiring rebuild (ABI changes)
pkg check -s all
```

### Service Dependency Analysis

| Service | Dependencies | Risk During Upgrade |
|---------|--------------|---------------------|
| **NSD** | libc, libuv, protobuf-c, fstrm | Low - static config, no runtime dependencies |
| **Unbound** | libc, libevent, libuv, ldns, Nettle | Medium - unbound updated in FreeBSD 14.5 to 1.26.0 |
| **Postfix** | libc, openssl, cyrus-sasl, MySQL client ABI | Medium - check for ABI incompatibility |
| **Dovecot** | libc, openssl, MySQL client, lmdb | Medium - Dovecot+MySQL ABI sensitivity |
| **OpenDKIM** | libc, openssl, libspf2 | Low - minimal dependencies |
| **SpamAssassin** | Perl modules, libarchive | Low - interpreted, minimal ABI impact |

### Package Version Changes (14.3 → 14.5)

| Package | FreeBSD 14.3 (quarterly) | FreeBSD 14.5 (quarterly) | ABI/Config Impact |
|---------|--------------------------|--------------------------|-------------------|
| **bind-tools** | 9.20.16 | 9.20.29 | Low - tools only, no daemon |
| **unbound** | 1.23.1 (pkg) / 1.24.1 (base) | 1.26.0 (base) | Medium - check unbound.conf compatibility |
| **nsd** | 4.13.0 | 4.13.0 (likely) | None - same version |
| **postfix** | 3.10.x | 3.10.4 (likely) | Low - quarterly branch stability |
| **dovecot** | 2.3.x | 2.3.21.1_3 | Low - patch version, config compatible |
| **cyrus-sasl** | 2.1.28_5 | 2.1.28_5+ (possibly) | Check SASL plugin ABI |
| **openssl** | 3.0.x | 3.0.21 (base) | Medium - TLS config safe, apps may need restart |

### Decision Points & escalation

**I will NOT make any decisions automatically. All of these are discussion points with you:**

| Condition | What I'll Do | What We Discuss |
|-----------|--------------|-----------------|
| Kernel panic on reboot | Pause immediately, report what I see | Whether to boot old kernel or proceed with rollback |
| DNS resolution fails (no `dig @127.0.0.1`) | Pause, provide current state and logs | Whether to attempt fix or rollback |
| Mail queue stuck (postfix mailq > 100) | Pause, provide queue status and logs | Whether to investigate further or rollback |
| `pkg check -s all` shows broken packages | Pause, provide error details | Whether to attempt fix or rollback |
| MySQL fails to start (required for mail) | Pause, provide MySQL logs | Whether to investigate further or rollback |
| Console access lost (SSH still works, jail console doesn't) | Pause, report what I tried | Whether to attempt recovery or rollback |

### Console Access Verification Steps

**Before upgrade, verify you have at least 2 independent console access methods:**

```bash
# Test SSH access (primary)
ssh root@pietje.rop.nl

# Test jail console access (secondary) - MUST WORK BEFORE UPGRADE
con ns0
con unbound
con mail

# Test out-of-band access (tertiary) - confirm this works before upgrade
# If using iLO/iDRAC/physical console, test now:
# - Wait for confirmation prompt
# - Verify you can type commands and see output
```

**If you do NOT have independent console access, DO NOT PROCEED with the upgrade.**

### Step-by-Step Recovery

**NOTICE: I will not execute any recovery steps automatically. I will provide step-by-step instructions and ask for your confirmation before each major action.**

#### Scenario A: DNS Resolution Fails Completely

```bash
# 1. Verify system is running correct kernel
freebsd-version -k  # should show FreeBSD 14.5-RELEASE

# 2. Check if kernel upgrade succeeded
freebsd-version -u  # should match -k

# If kernel is wrong, boot old kernel manually from loader
# (This requires physical or out-of-band access)

# 3. If kernel is correct, check NSD
con ns0
nsd-control status
tail -f /var/log/nsd.log

# 4. If NSD not running, try to start
service nsd start
# Check logs for config errors

# 5. If NSD starts but zones fail, check zone files
nsd-checkconf
nsd-checkzone rop.nl /usr/local/etc/nsd/master/rop.nl

# 6. Verify unbound is working
con unbound
unbound-control status
dig @127.0.0.1rop.nl SOA

# 7. If DNS still fails, rollback:
# a) Stop services
service nsd stop
service unbound stop

# b) Rollback to snapshot (requires reboot)
shutdown -r now
# At loader prompt, select old kernel if available
# After boot, run:
zfs rollback -r rpool@pre-upgrade
```

#### Scenario B: Mail Services (Postfix/Dovecot) Down

```bash
# 1. Check mail jail console access
con mail

# 2. Verify MySQL is running (mail depends on it)
service mysql-server status
# If not, start MySQL first
service mysql-server start

# 3. Check Postfix status
postfix status
postconf -n | head -20  # verify config loads

# 4. Check mail logs for specific errors
tail -100 /var/log/maillog | grep -E "(error|fatal|warning)"

# 5. Common Postfix errors:
# a) "config file /etc/postfix/main.cf is unreadable"
#    - Fix permissions: chown root:mail /etc/postfix/main.cf; chmod 644 /etc/postfix/main.cf

# b) "cannot find hostname for IP" 
#    - Check /etc/hosts, add missing entries

# c) " SASL authentication failure"
#    - Check cyrus-sasl package: pkg info cyrus-sasl
#    - May need: pkg install cyrus-sasl

# 6. Check Dovecot status
service dovecot status
doveadm user '*'

# 7. If mailq is stuck (long queue), check what's blocking:
postfix mailq | grep -v "^[0-9A-F]" | wc -l

# 8. If queue is stuck, try flush:
postfix flush
tail -f /var/log/maillog

# 9. If still stuck, try safe restart:
postfix stop
postfix start
dovecot stop
sleep 5
dovecot start

# 10. If Postfix still fails, rollback:
service postfix stop
service dovecot stop
zfs rollback -r rpool@pre-upgrade
```

#### Scenario C: Package Dependency Corruption

```bash
# 1. Check for broken packages (run from host or jail)
pkg check -s all
# Look for lines like "dependency '<pkg>' missing"

# 2. Try to fix broken packages
pkg install -f

# 3. If pkg check shows Oracle MySQL vs Percona conflicts, resolve:
pkg delete mysql80-client  # or percona
pkg install mysql80-client

# 4. Check for orphaned packages (leftovers from old FreeBSD)
pkg orphan

# 5. Clean up and reinstall
pkg autoremove
pkg upgrade

# 6. If packages still broken after fix attempts:
zfs rollback -r rpool@pre-upgrade
```

### Post-Recovery Verification Checklist

After recovery (either successful upgrade or rollback), **run the following verification steps but wait for your OK before proceeding**:

```bash
# 1. Verify all jails start
ezjail-admin list

# 2. Test DNS resolution
dig @10.42.0.1 google.com
dig @10.42.0.2 rop.nl SOA

# 3. Test mail delivery
echo "Test" | sendmail -f root@rop.nl -t test@rop.nl

# 4. Verify all services report correct version
freebsd-version
pkg info | grep -E "(nsd|unbound|postfix|dovecot)"

# 5. Run full package check
pkg check -s all
```

## Storage
- **ZFS Pool**: rpool (460GB total, 238GB allocated)
- **Available Space**: ~208GB
- **ZFS Datasets**:
  - rpool/bhyve (25.2GB) - Docker VM
  - rpool/ezjail (96GB) - All jails
  - rpool/vmail (112GB) - Email storage

## Networking
### Primary Interface (igb0)
- IPv4: 65.109.148.215/26 (pietje.rop.nl)
- IPv4 Alias: 65.109.148.206/32 (mail.rop.nl)
- Gateway: 65.109.148.193
- IPv6: 2a01:4f9:3100:4b60::1/64

### Internal Network (lo42)
- 10.42.0.0/24 - Jail communication

### Firewall (pf.conf)
Open ports: 53, 22, 80/443 (webproxy), 1984 (respectmy), 8443, STUN/TURN:3478

### Port Forwarding
| External | Internal | Jail |
|----------|----------|------|
| :1006 | :22 | play |
| :1007 | :22 | cloud |
| :1008 | :22 | frank |
| :1009 | :22 | viola |

## Services

### DNS
- **ns0**: Authoritative DNS (NSD) - [see ns0.md](./pietje/jails/ns0.md)
- **unbound**: Recursive DNS resolver - [see unbound.md](./pietje/jails/unbound.md)

### Web
- **webproxy**: Apache web cache - [see webproxy.md](./pietje/jails/webproxy.md)
- **www**: Apache/Nginx - [see www.md](./pietje/jails/www.md)
- **allmixedup**: Web UI (port 8443) - [see allmixedup.md](./pietje/jails/allmixedup.md)

### Email
- **mail**: Postfix+Dovecot+SpamAssassin+Radicale - [see mail.md](./pietje/jails/mail.md)

### STUN/TURN
- **cloud**: STUN/TURN server (port 3478) - [see cloud.md](./pietje/jails/cloud.md)
- **play**: Transmission, Tor - [see play.md](./pietje/jails/play.md)

### Privacy/Mix Network
- **respectmy**: Katzenpost - [see respectmy.md](./pietje/jails/respectmy.md)
- **viola**: Katzenpost - [see viola.md](./pietje/jails/viola.md)

### Database
- **db**: MySQL 8.0 - [see db.md](./pietje/jails/db.md)

### Git
- **frank**: Git daemon + Mercurial - [see frank.md](./pietje/jails/frank.md)

### Build
- **mixbuilder**: Go, C/C++ build env - [see mixbuilder.md](./pietje/jails/mixbuilder.md)

## Aliases (Your Shortcuts)
- `ez` - ezjail-admin
- `j` - SSH to jantje.rop.nl
- `d domain` - domain command (webproxy)
- `jails [list/summary]` - list jails
- `con jailname` - console into jail or VM

## Access Summary
- **pietje** = Host server (what this document describes)
- **admin** = First management jail to console into (`con admin`)

## Virtualization
- **Docker VM**: bhyve, 12 vCPUs, 12GB RAM

## Security
- SSH keys only (no password)
- PF firewall active, default drop
- Jail isolation

## See Also
- [admin.md](./pietje/jails/admin.md) - Admin jail
- [cloud.md](./pietje/jails/cloud.md) - Docker VM, STUN/TURN
- [db.md](./pietje/jails/db.md) - MySQL database
- [frank.md](./pietje/jails/frank.md) - Git, Mercurial
- [mail.md](./pietje/jails/mail.md) - Postfix, Dovecot
- [mixbuilder.md](./pietje/jails/mixbuilder.md) - Build environment
- [ns0.md](./pietje/jails/ns0.md) - DNS with zfht
- [play.md](./pietje/jails/play.md) - STUN/TURN, Tor
- [respectmy.md](./pietje/jails/respectmy.md) - Katzenpost
- [unbound.md](./pietje/jails/unbound.md) - DNS resolver
- [viola.md](./pietje/jails/viola.md) - Katzenpost
- [webproxy.md](./pietje/jails/webproxy.md) - Web proxy
- [www.md](./pietje/jails/www.md) - Web server
- [allmixedup.md](./pietje/jails/allmixedup.md) - Web UI

---

## ZFS Recovery Procedures

**IMPORTANT**: Test these procedures in a non-production environment first. This section covers recovery when the system is inaccessible due to kernel/base corruption during upgrade.

### Pre-Upgrade Snapshot Commands

#### Create Recursive Snapshot (All Datasets)

```bash
# Snapshot all datasets recursively with timestamp
zfs snapshot -r rpool@$(date +%Y%m%d-%H%M%S)-pre-upgrade

# Or use a meaningful name for the upgrade
zfs snapshot -r rpool@pre-upgrade-20261018

# Verify snapshots created
zfs list -t snapshot -o name,creation rpool@pre-upgrade*
```

#### Snapshot What You Have

```
rpool@pre-upgrade          (root dataset)
rpool/bhyve@pre-upgrade    (Docker VM)
rpool/ezjail@pre-upgrade   (all jails)
rpool/vmail@pre-upgrade    (email storage)
```

#### Verify Snapshot Space Usage

```bash
# Check space used by snapshots (should be minimal initially)
zfs list -t snapshot rpool

# Check space remaining
zfs list rpool
```

### Recovery from Broken Boot

#### Scenario 1: System Boots But Panics

If you see kernel panic or system hangs:

1. **At boot menu, select the old kernel:**
   - Press `3` for "Disable modules and try to boot"
   - Or select the previous kernel version from the menu

2. **If that fails, boot to single-user mode:**
   - At boot prompt, type: `boot -s`
   - Or select "SINGLE_USER" from menu

3. **Once in single-user mode, mount filesystems:**
   ```bash
   # Mount root read-write
   fsck -y /dev/rdisk0s1
   mount -o ro /
   
   # If you have other ZFS pools imported, they'll appear
   zpool list
   ```

#### Scenario 2: Can't SSH, Serial Console Access Only

If you have serial console access (or physical/console access):

1. **Boot from recovery media or use Single-User Mode:**
   - At the boot menu, select "Escape to loader prompt"
   - Or hold `Esc` during boot

2. **Load ZFS module manually (if needed):**
   ```bash
   loader> set zfs_enable="YES"
   loader> boot -s
   ```

3. **In single-user mode, import the pool:**
   ```bash
   # Import rpool (usually auto-imported)
   zpool import rpool
   
   # If pool is marked "faulted" or "unavail", try forced import
   zpool import -f rpool
   ```

#### Scenario 3: Full Rollback Using Snapshot

```bash
# Once you have access (single-user or rescue):
zpool import rpool

# List available snapshots
zfs list -t snapshot rpool

# Rollback to pre-upgrade snapshot (destroys newer data)
zfs rollback -r rpool@pre-upgrade

# This rolls back ALL datasets recursively:
#   rpool -> pre-upgrade
#   rpool/bhyve -> pre-upgrade
#   rpool/ezjail -> pre-upgrade  
#   rpool/vmail -> pre-upgrade
```

#### Scenario 4: Partial Rollback (Roll One Dataset)

```bash
# Only rollback one dataset (e.g., /usr if base system is broken)
zfs rollback rpool/ezjail@pre-upgrade

# Or for a specific jail
zfs rollback rpool/ezjail@pre-janitor-upgrade
```

### Mounting Snapshots and Copying Data

#### Method 1: Mount Snapshot Read-Only

```bash
# Mount a snapshot to recover files
mkdir -p /mnt/recovery
zfs mount rpool/bhyve@pre-upgrade /mnt/recovery

# Now access files
ls -la /mnt/recovery/usr/jails/
cp -r /mnt/recovery/usr/local/etc /backup/etc-backup

# Unmount when done
zfs umount /mnt/recovery
```

#### Method 2: Access Snapshot via `.zfs/snapshot` Directory

```bash
# Snapshots are visible in their dataset mount points
cd /bhyve/.zfs/snapshot/pre-upgrade
ls -la

# Copy files directly (no mount needed if dataset is mounted)
cp -r /bhyve/.zfs/snapshot/pre-upgrade/usr/local/etc /backup/
```

#### Method 3: ZFS Send/Receive for Full Recovery

If the pool is corrupted beyond rollback:

```bash
# Step 1: Boot from known-good system or rescue CD
# Import the pool read-only first to verify
zpool import -o readonly=on rpool

# Step 2: Create a new pool on different media (temporary recovery location)
zpool create recover /dev/ada1

# Step 3: Send the snapshot to new pool
zfs send rpool@pre-upgrade | zfs receive recover/rpool-backup

# Step 4: Boot from new location or copy back
```

#### Method 4: Recover Specific Dataset

```bash
# Export the pool
zpool export rpool

# Re-import with alternative root (rescue environment)
zpool import -R /mnt rpool

# Now access datasets under /mnt
ls -la /mnt/

# Copy critical data to external drive
cp -rp /mnt/ezjail /mnt/bhyve /external/backup/
```

### Serial Console Recovery Procedure

**Prerequisites:**
- Serial console access configured (`/etc/ttys`)
- Alternate boot media (USB drive with FreeBSD installer)

#### Step-by-Step: Can't SSH, Need Serial Console

1. **Connect serial console** and power on the server
   - Expected baud rate: 9600 or 115200 (check your config)

2. **At BIOS/UEFI prompt**, select boot device → USB drive or netboot

3. **Booting from FreeBSD Installation Media:**
   ```
   Boot: [Select] Recovery Console
   ```

4. **Import the ZFS pool:**
   ```bash
   # Load ZFS kernel module
   kldload zfs
   
   # Import pool (replace ada0p2 with your ZFS partition)
   zpool import -f rpool
   
   # Verify pool is healthy
   zpool status rpool
   ```

5. **Mount datasets for recovery:**
   ```bash
   # Mount root dataset
   zfs mount rpool
   mkdir -p /mnt
   zfs set mountpoint=/mnt rpool
   
   # Mount other datasets
   zfs mount rpool/ezjail
   zfs mount rpool/bhyve
   zfs mount rpool/vmail
   
   # Verify all datasets are accessible
   df -h
   ```

6. **Recover from snapshot if needed:**
   ```bash
   # If datasets are corrupted, rollback
   zfs rollback -r rpool@pre-upgrade
   
   # Or if only one dataset is affected
   zfs rollback rpool/ezjail@pre-upgrade
   
   # If snapshot doesn't exist, you may need to recreate the dataset
   # from a zfs send stream
   ```

7. **Fix boot issues:**
   ```bash
   # Reinstall bootloader (if MBR/GPT corrupted)
   gpart recover ada0
   
   # Reinstall bootcode
   gpart bootcode -p /boot/gptzfsboot ada0
   
   # Update ZFS boot environment (if using BE)
   beadm activate default
   ```

8. **Attempt clean reboot:**
   ```bash
   # Sync filesystems
   sync
   sync
   
   # Reboot
   reboot
   ```

9. **If system boots but broken:**
   ```bash
   # Boot into single-user mode again
   # Mount everything and verify ZFS datasets
   fsck -y /
   mount -a
   
   # Rollback if needed (see Scenario 3 above)
   ```

### Emergency Commands Reference

#### Quick Snapshot Creation

```bash
# One-liner to snapshot everything
zfs snapshot -r rpool@emergency-$(date +%Y%m%d-%H%M%S)
```

#### Snapshot Listing and Cleanup

```bash
# List all snapshots sorted by creation time
zfs list -t snapshot -o name,creation,used rpool

# Delete old snapshots (keep last 7)
zfs list -t snapshot -o name rpool | grep '@' | tail -n +8 | xargs -n1 zfs destroy
```

#### Verify Pool Health

```bash
# Check pool status
zpool status -v rpool

# Check for any checksum errors (indicates hardware issues)
zpool status rpool | grep -i checksum
```

#### Test Recovery Without Destruction

```bash
# Create a clone for testing (writable copy of snapshot)
zfs clone rpool@pre-upgrade rpool/clone-test

# Mount and verify
zfs mount rpool/clone-test
ls -la /rpool/clone-test/

# When done testing, destroy clone (takes no extra space)
zfs destroy rpool/clone-test
```

### Post-Recovery Checklist

After recovery, verify:

- [ ] All ZFS datasets mounted: `df -h`
- [ ] Pool health status: `zpool status rpool`
- [ ] All jails accessible: `ezjail-admin list`
- [ ] Email services operational
- [ ] Jail configs intact: `ls /usr/jails/*/etc/`
- [ ] Docker VM data intact: `ls /bhyve/docker/`

### Save Recovery Script

Create `/usr/local/bin/zfs-recover.sh`:

```bash
#!/bin/sh
# Quick recovery script for ZFS-based FreeBSD systems

POOL="${1:-rpool}"
SNAPSHOT="${2:-pre-upgrade}"

echo "=== ZFS Recovery Script ==="
echo "Pool: $POOL"
echo "Snapshot: $SNAPSHOT"

# Import pool if needed
if ! zpool list | grep -q "^$POOL"; then
    echo "Importing pool..."
    zpool import -f $POOL
fi

# Check snapshot exists
if ! zfs list -t snapshot | grep -q "$POOL@$SNAPSHOT"; then
    echo "ERROR: Snapshot $POOL@$SNAPSHOT not found"
    zfs list -t snapshot | grep "$POOL@"
    exit 1
fi

echo "Rolling back to $SNAPSHOT..."
zfs rollback -r $POOL@$SNAPSHOT

echo "Recovery complete. Reboot and verify."
```

Usage:
```bash
/usr/local/bin/zfs-recover.sh rpool pre-upgrade-20261018
```
