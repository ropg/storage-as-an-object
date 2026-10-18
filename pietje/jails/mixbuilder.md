# mixbuilder Jail

## Overview
**Hostname**: mixbuilder  
**Internal IP**: 10.42.0.12  
**Purpose**: Build environment for compilation and build processes

## Configuration
- **ZFS Dataset**: rpool/ezjail/mixbuilder (1.97GB)
- **Root Directory**: /usr/jails/mixbuilder
- **DevFS**: Enabled with devfsrules_jail
- **ProcFS**: Enabled
- **FdescFS**: Enabled

## Installed Software
### Build Tools
- go 1.24 (Go programming language)
- gmake 4.4.1
- cmake meta-port

### Languages & Compilers
- gcc 14.2 (GNU Compiler Collection)
- golang 1.24

### Utilities
- git 2.51.0
- rsync 3.4.1_4
- nano editor
- sudo

### Protobuf Support
- protobuf 29.5
- protobuf-c 1.5.1_3

### Networking
- curl 8.16.0
- expat 2.7.3

## Services
No long-running services. This is a build environment jail.

## Network Configuration
- **Internal IP**: 10.42.0.12 (lo42)
- Accessible via `con mixbuilder` from pietje host

## Usage Notes
1. Designed for compiling code and building software
2. Includes Go compiler, C/C++ toolchain (gcc), and protobuf support
3. No web services or external-facing ports

## Related Commands
```bash
# Console into mixbuilder jail
con mixbuilder

# Compile Go code
go build main.go

# Use make
gmake

# Access git repositories
git clone <repository>
```
