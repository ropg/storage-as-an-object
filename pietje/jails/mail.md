# mail Jail

## Overview
**Hostname**: mail  
**Internal IP**: 65.109.148.206 (public)  
**IPv6**: 2a01:4f9:3100:4b60:f000::1  
**Purpose**: Full mail server stack

## Configuration
- **ZFS Dataset**: rpool/ezjail/mail (819MB)
- **Root Directory**: /usr/jails/mail
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### Mail Services
- Postfix 3.10.4 (SMTP server with MySQL support)
- Dovecot 2.3.21.1 (IMAP/POP3 with MySQL support)
- Dovecot Pigeonhole (Sieve plugin for filtering)

### Mail Security
- OpenDKIM 2.10.3 (DKIM signing/verification)
- SpamAssassin 4.0.1 (Spam filtering)
- spamass-milter (Sendmail Milter plugin)

### Authentication & Encryption
- cyrus-sasl 2.1.28_5 (SASL authentication)
- gnupg2 2.4.8 (GnuPG)
- gnutls 3.8.11 (TLS library)
- openssl (via base system)

### Web-based Services
- Radicale 3.5.6 (CalDAV/CardDAV server)
- Python 3.11 with:
  - acme, certbot (Let's Encrypt)
  - passlib (password hashing)
  - vobject (iCalendar support)

### Utilities
- muTT 2.2.14 (terminal mail reader)
- mutt with PGP/GPG support
- nano editor
- sudo

### Mail-related Perl Modules
- p5-Mail-*, p5-Email-* modules
- p5-Crypt-OpenSSL-*, p5-Digest-HMAC
- p5-Net-* (DNS, DNSSEC)

### Databases
- MySQL 8.0 client
- lmdb (Lightning Memory-Mapped Database)

### System
- unbound 1.24.2 (DNS resolver)
- nettle 3.10.2 (cryptographic library)

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Postfix SMTP | 25, 465, 587 | TCP | Mail transfer |
| Dovecot IMAP | 143, 993 | TCP | Mail access |
| Dovecot POP3 | 110, 995 | TCP | Mail access |
| Radicale CalDAV/CardDAV | 5232 | TCP | Calendar/contacts |
| OpenDKIM | - | TCP | DKIM signing |

## Network Configuration
- **Public IPv4**: 65.109.148.206
- **Public IPv6**: 2a01:4f9:3100:4b60:f000::1
- Ports open in pf.conf: 25, 80, 465, 466, 587, 993, 995, 5232

## Storage
- **Vmail**: /usr/jails/mail/var/vmail (112GB ZFS dataset)
  - Virtual mailboxes for all users

## Usage Notes
1. Full-featured mail server with IMAP, SMTP, CalDAV/CardDAV
2. SPF/DKIM/DMARC support via OpenDKIM
3. SpamAssassin integration for spam filtering
4. Radicale provides calendar/contacts via CalDAV/CardDAV

## Mail Ports (pf.conf)
- Port 25: SMTP
- Port 80: ACME challenge (Let's Encrypt)
- Ports 465, 466: SMTPS
- Port 587: Submission (SMTP with auth)
- Port 993: IMAPS
- Port 995: POP3S
- Port 5232: Radicale

## Domain Management (postfixadmin)

### Virtual Domains
Domains are stored in MySQL database `postfix`:
- Table: `domain`
- Columns: domain, description, maildir, backupmx, active

### Creating a Domain
```bash
# Console into mail jail
con mail

# Add domain via postfixadmin web interface
# Or directly in MySQL:
mysql -u root -p postfix

INSERT INTO domain (domain, description, maildir, backupmx, active)
VALUES ('newdomain.com', 'My domain', 'newdomain.com/', 0, 1);

# Add mailboxes for the new domain
INSERT INTO mailbox (username, password, name, maildir, domain, active)
VALUES ('info@newdomain.com', ENCRYPT('password'), 'Info User',
        'newdomain.com/info/', 'newdomain.com', 1);

# Reload postfix for changes to take effect
postfix reload
```

### Adding Mailboxes
```sql
INSERT INTO mailbox (username, password, name, maildir, domain, active)
VALUES ('user@domain.com', ENCRYPT('password'), 'Full Name',
        'domain.com/user/', 'domain.com', 1);
```

### Admin Access
- postfixadmin available at: https://mail.rop.nl/postfixadmin/
- Default credentials may need to be set via setup script

## Related Commands
```bash
# Console into mail jail
con mail

# Restart mail services
service postfix restart
service dovecot restart
service radicale restart

# View mail queue
postfix mailq

# Check Dovecot status
doveadm user '*'

# List domains in postfixadmin MySQL table
mysql -u root -p postfix -e "SELECT * FROM domain;"

# Reload Postfix configuration
postfix reload

# Check mail logs
tail -f /var/log/maillog
```
