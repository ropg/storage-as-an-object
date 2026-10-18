# frank Jail

## Overview
**Hostname**: frank  
**Internal IP**: 10.42.0.8  
**IPv6**: 2a01:4f9:3100:4b60:1008::1  
**Purpose**: Git/Mercurial server and miscellaneous services

## Configuration
- **ZFS Dataset**: rpool/ezjail/frank (10.6GB)
- **Root Directory**: /usr/jails/frank
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled
- **Additional Parameters**: `allow.raw_sockets=1`

## Installed Software
### Version Control
- git 2.51.0 (distributed SCM)
- mercurial (Mercurial VCS)

### Build Tools
- go 1.24 (Go programming language)
- gmake 4.4.1
- pkgconf 2.4.3

### Web & Networking
- Apache 2.4
- mod_php82 8.2.29 (PHP)
- curl 8.16.0

### Utilities
- nano editor
- sudo
- base FreeBSD 14.3 system
- pkg 2.6.2_1

### Perl Modules (for mail handling)
- p5-Authen-SASL
- p5-Crypt-URandom
- p5-Digest-HMAC
- p5-Error
- p5-IO-Socket-SSL
- p5-MIME-Base32, p5-MIME-Base64
- p5-Mozilla-CA
- p5-Net-SSLeay
- p5-URI

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Apache HTTP | 80, 443 | TCP | Web server |
| Git daemon | 9418 | TCP | Git version control |
| Mercurial | - | HTTP | Hg web interface |

## Network Configuration
- **Internal IP**: 10.42.0.8 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1008::1 (igb0)
- SSH accessible via port 1008 on pietje host

## Usage Notes
1. Frank provides Git and Mercurial version control services
2. Web interface for repositories via Apache
3. SSH access available through port forwarding (port 1008)

## Related Commands
```bash
# Console into frank jail
con frank

# Restart Apache
service apache24 restart

# Access git repository
git clone git://10.42.0.8/repo-name

# SSH into frank via port forwarding
ssh -p 1008 root@pietje.rop.nl
```
