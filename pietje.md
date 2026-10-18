# pietje.rop.nl - Server Overview

## System Information
- **Hostname**: pietje.rop.nl
- **OS**: FreeBSD 14.3-RELEASE-p2 GENERIC amd64
- **Config**: ezjail_enable, vm_enable, docker_enable

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
