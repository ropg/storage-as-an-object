# admin Jail

## Overview
**Hostname**: admin  
**Internal IP**: 10.42.0.5  
**Purpose**: System administration and monitoring

## Configuration
- **ZFS Dataset**: rpool/ezjail/admin (441MB)
- **Root Directory**: /usr/jails/admin
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
Based on basejail template:
- Base FreeBSD 14.3 system
- ezjail-admin for jail management

## Services & Features
This is primarily an administration console jail. It's designed to:
- Serve as a management entry point
- Provide quick access to system administration tools
- Host monitoring scripts and utilities

## Connectivity
- Accessible via `con admin` from pietje host
- Cannot be accessed directly from outside the internal network (10.42.x.x)

## Notes
- Jail hostname is set to "admin"
- This jail serves as a convenient place for admin scripts and tools
- No web services or external-facing ports

## Related Commands
```bash
# Console into admin jail
con admin

# List all jails (from pietje host)
jails

# Execute command on admin jail
ezjail-admin console -e "command" admin
```
