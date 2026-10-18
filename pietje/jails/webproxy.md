# webproxy Jail

## Overview
**Hostname**: webproxy  
**Internal IP**: 10.42.0.4  
**IPv6**: 2a01:4f9:3100:4b60:1004::1  
**Purpose**: Web caching proxy

## Configuration
- **ZFS Dataset**: rpool/ezjail/webproxy (956MB)
- **Root Directory**: /usr/jails/webproxy
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### Web Server/Proxy
- Apache 2.4.65_1 (web server)
- htcacheclean (Apache cache cleanup utility)

### Utilities
- curl 8.14.1
- nano editor
- sudo

### Protobuf Support
- protobuf 29.5
- protobuf-c 1.5.1_3

### Networking
- libevent 2.1.12
- libuv 1.51.0

## Services
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Apache HTTP | 80, 443 | TCP | Web proxy/cache |

## Network Configuration
- **Internal IP**: 10.42.0.4 (lo42)
- **Public IPv6**: 2a01:4f9:3100:4b60:1004::1 (igb0)
- Web accessible from external network

## Usage Notes
1. This jail acts as a web caching proxy for multiple domains
2. Apache mod_cache configured for HTTP/HTTPS caching
3. Accessible on ports 80 and 443

## Domain Management (domain command)

### Overview
The `domain` command is used to add or remove domains from the webproxy configuration. It's actually a wrapper that opens the webproxy jail console with domain-specific commands.

### Usage
```bash
# Add a new domain
domain add example.com

# Remove a domain
domain remove example.com

# List domains
domain list
```

### How It Works
The `domain` command is defined in `.bash_profile`:
```bash
domain() {
    ezjail-admin console -e "domain $*" webproxy
}
```

### Domain Configuration Files
Domain configs are stored in webproxy jail at `/usr/local/etc/apache24/extra/sites-available/`

### Adding a Domain Manually
```bash
# Console into webproxy jail
con webproxy

# Create site config in sites-available/
n /usr/local/etc/apache24/extra/sites-available/example.com.conf

# Enable the site
a2ensite example.com

# Reload Apache
service apache24 reload
```

### Removing a Domain Manually
```bash
# Console into webproxy jail
con webproxy

# Disable the site
a2dissite example.com

# Remove config file
rm /usr/local/etc/apache24/extra/sites-available/example.com.conf

# Reload Apache
service apache24 reload
```

## Related Commands
```bash
# Console into webproxy jail
con webproxy

# Restart Apache
service apache24 restart

# Clean cache
htcacheclean -t /var/cache/apache2/mod_cache_disk

# Reload Apache config
service apache24 reload

# Check virtual host configuration
apachectl -t -D DUMP_VHOSTS
```
