# Spangap Organization Repositories

## Overview

The **Spangap** GitHub organization hosts a unified platform for developing firmware applications on ESP32 microcontrollers with full-featured web interfaces and LCD displays. At its core, Spangap is a **Device Application Framework** that enables developers to build sophisticated embedded systems without the traditional constraints of polling-based architectures, limited multitasking, or fragmented UI development.

Spangap solves several fundamental problems that have historically made ESP32 development challenging:

1. **Proper multitasking** - Using an Inter-Task Streaming (ITS) system based on RTOS notifications, tasks can block efficiently without consuming CPU cycles while waiting for events from other tasks
2. **Hierarchical value store** - A unified configuration tree that synchronizes automatically between the device (cJSON) and browser (Pinia), so changing `net.wifi.enable=1` in the CLI immediately updates web UI toggles and LCD settings
3. **Unified interface layer** - Both a reactive web interface (using Vue + Quasar) and an LVGL-based phone-style LCD UI that share the same configuration model
4. **Modular architecture** - Applications are packaged as "straddles" — self-contained modules with metadata, an ESP-IDF firmware component, and browser NPM packages

The framework is written in C++ for the ESP-IDF environment with Python tooling, and it powers **Reticulous** — a full mesh networking stack for Reticulum radio protocols.

## Architecture

Spangap is built around the concept of **straddles** — modular components that "straddle" both the embedded device and the web interface. Each straddle provides:

- `esp-idf/` — ESP-IDF component with C++ code
- `browser/` — NPM package for the reactive web interface  
- `data/` — Static assets and documentation
- `straddle.yaml` — Metadata describing dependencies, settings schema, and app registration

The build system (`spangap` CLI tool) resolves dependencies between straddles, generates a unified boot sequence, combines all browser code into one SPA, and produces both firmware images and web assets.

### Platform Straddles

The platform consists of several foundational straddles that form a layered architecture:

| Layer | Component | Purpose |
|-------|-----------|---------|
| **Runtime** | `spangap-core` | Base firmware primitives: storage, ITS IPC, logging, CLI, auth, power management |
| **Networking** | `spangap-net` | IP stack: WiFi STA/AP, TCP/UDP, mbedTLS server, NTP, mDNS |
| **Web Interface** | `spangap-web` | HTTPS server, WebRTC plumbing, browser SPA shell |
| **Display** | `spangap-lcd` | LVGL phone-style UI: launcher, settings, terminal |
| **Apps** | Various straddles | Reticulum mesh, audio, camera, remote access services |

## Repository Descriptions

### Core Platform Repositories

#### [spangap](https://github.com/spangap/spangap)
**Language:** Python

The command-line launcher and build system. A single-file tool that provisions a Docker build container, resolves straddle dependencies, stages firmware/browser/LCD halves, gates Kconfig, generates boot glue, and handles flashing/serial monitoring. The host needs only Docker, git, and Python 3.

The launcher stays thin — the real build system lives in workspace-specific skeleton created by `spangap init`. The launcher auto-updates when newer versions are available.

#### [spangap-core](https://github.com/spangap/spangap-core)
**Language:** C++

The base firmware runtime containing the primitives every Spangap device needs. Its symbols (empty prefix) read as language primitives: `storageGet`, `cliRegister`, `info`, `itsPoll`, `gp_alloc`.

**Key subsystems:**
- `init` — Four-call boot sequence, generated dispatcher, boot barriers
- `storage` — Hierarchical config tree (cJSON) with browser sync and persistence
- `fs` — DRAM-stack file I/O for LittleFS + FAT/SD (allows PSRAM stacks)
- `its` — Inter-Task Streaming: the platform's only IPC (no polling required)
- `logging` — Log task with levels, file output, serial console
- `cli` — On-device Unix-like command line (serial/web/SSH)
- `auth` — Credential realms and session cookies
- `cron` — Minute-resolution scheduler for deep-sleep-aware tasks
- `power-management` — DFS + light/deep sleep with notify-driven CPU boost

#### [spangap-web](https://github.com/spangap/spangap-web)
**Language:** C++

The web-stack half of the platform: HTTPS server, WebDAV, cookie-session auth enforcement, WebRTC DataChannel plumbing, and the browser SPA shell.

**Key subsystems:**
- `web` — HTTP/HTTPS server, file serving, auth enforcement
- `webrtc` — DTLS/ICE-lite/SCTP plumbing and DataChannel ↔ ITS router
- `browser-shell` — SPA: Dock launcher, settings tree renderer, WebRTC session

When this straddle is in the build, it folds every other straddle's `browser/` directory into one unified SPA.

#### [spangap-net](https://github.com/spangap/spangap-net)
**Language:** C++

The IP networking half: WiFi, TCP/UDP, TLS, NTP, and mDNS. Any straddle needing an IP stack (web, SSHD, ACME, DuckDNS, UPnP, WireGuard) pulls this in.

**Key subsystems:**
- `net` — WiFi STA/AP state machine, TCP socket relay, event bus
- `tls` — Shared mbedTLS server with EC P-256 certs and hot reload
- `ntp` — Non-blocking time sync via esp_sntp, timezone resolver
- `mdns` — `<hostname>.local` advertisement

Bundled remote-access services: ACME, DuckDNS, UPnP, WireGuard, SSHD.

#### [spangap-lcd](https://github.com/spangap/spangap-lcd)
**Language:** C++

The on-device LVGL v9 user interface: phone-style shell with status bar, scrolling launcher, navigation, recents switcher, and built-in Settings/Log/CLI apps.

**Key subsystems:**
- `shell` — Launcher, status bar, navigation state machine
- `apps` — App lifecycle and per-app keypad focus
- `settings` — Runtime settings tree renderer
- `terminal` — libvterm-backed VT100 terminal
- `keyboard` — On-screen keyboard with flick/long-press

Any straddle wanting screen presence installs an app or settings pane through the public API — no direct `lv_*` calls needed.

### Board Support Packages

#### [hw-lilygo-tdeck](https://github.com/spangap/hw-lilygo-tdeck)
**Language:** C++

Board-support straddle for LilyGo T-Deck Plus: power/CS bring-up, input HAL (touch trackball), battery monitor, microSD, and pin maps. The reference development platform for Spangap.

Features: ESP32-S3FN16R8, 16MB flash, 8MB octal PSRAM, SX1262 LoRa, 320×240 LCD, QWERTY keyboard, trackball, GPS.

#### [hw-heltecv4](https://github.com/spangap/hw-heltecv4)
**Language:** C++

Board-support for Heltec WiFi LoRa 32 V4: headless node with built-in LoRa radio, no LCD. Secondary reference platform.

#### [hw-waveshare-28b](https://github.com/spangap/hw-waveshare-28b)
**Language:** C++

Board-support for Waveshare ESP32-S3-Touch-LCD-2.8B: 480×640 touch screen, no radio but WiFi/BLE capable.

#### [hw-wismesh-tap-v2](https://github.com/spangap/hw-wismesh-tap-v2)
**Language:** C++

Board-support for RAK WisMesh TAP V2: touch screen (on-device UI), GNSS, ESP32-S3.

#### [hw-meshnology-w12](https://github.com/spangap/hw-meshnology-w12)
**Language:** C++

Board-support for Meshnology W12: LR2021 LoRa (30dBm), OLED status pages, ESP32-S3.

#### [hw-lilygo-tbeam-supreme](https://github.com/spangap/hw-lilygo-tbeam-supreme)
**Language:** C++

Board-support for LilyGo T-Beam S3 Supreme: AXP2101 power rails, GNSS, RTC, OLED status pages.

#### [hw-nibble-zero](https://github.com/spangap/hw-nibble-zero)
**Language:** C++

Board-support for Retia Nibble Zero: ESP32-S3-Zero module with LoRa radio.

#### [hw-linux](https://github.com/spangap/hw-linux)
**Language:** C++

Board-support for ESP-IDF Linux target: builds the same firmware for simulation, where stations run as processes and talk over virtual radio on one machine. Used by [sim-mesh](https://github.com/sim-mesh/sim-mesh).

### Application Straddles

#### [viewer](https://github.com/spangap/viewer)
**Language:** C

A micro HTML/Markdown document viewer for Spangap devices. Two front ends:

- **LCD** — "Info" launcher app (red `?` icon) that renders safe HTML subset into LVGL
- **Web UI** — "Viewer" Dock app: floating window with `<iframe>` serving local documents

Uses vendored MD4C for Markdown→HTML conversion on the device's web server.

#### [audio](https://github.com/spangap/audio)
**Language:** C

Generic I2S full-duplex audio engine with packet server:

- **Mic → network** — Live microphone streaming as fixed-size blocks (compatible with seccam format)
- **Network → speaker** — Decodes and mixes all inbound audio into speaker output
- **WAV playback** — Streams WAV files from filesystem into same mixer

Browser DataChannel label `audio:1` bridges directly to the audio task.

#### [spangap-ble](https://github.com/spangap/spangap-ble)
**Language:** C++

Bluetooth Low Energy support straddle (not detailed in available documentation).

### Remote Access Services

#### [acme](https://github.com/spangap/acme)
**Language:** C++

ACMEv2 client for fetching and renewing Let's Encrypt TLS certificates via DNS-01 or HTTP-01 challenges.

#### [duckdns](https://github.com/spangap/duckdns)
**Language:** C++

DuckDNS dynamic DNS updater. Also publishes the TXT record ACME needs for DNS-01.

#### [upnp](https://github.com/spangap/upnp)
**Language:** C++

UPnP-IGD port mapper that forwards HTTPS and WebRTC ports through NAT routers.

#### [wg](https://github.com/spangap/wg)
**Language:** C++

WireGuard client tunnel — the CG-NAT-friendly alternative to UPnP+DuckDNS+ACME.

#### [sshd](https://github.com/spangap/sshd)
**Language:** C

SSH-2 server and client that bridge into the CLI/log: post-quantum KEX, publickey or password auth.

#### [eduroam](https://github.com/spangap/eduroam)
**Language:** C++

Eduroam enterprise WiFi authentication support.

#### [updater](https://github.com/spangap/updater)
**Language:** C++

Over-the-air firmware updater for signed firmware updates.

### Supporting Infrastructure

#### [flashmon](https://github.com/spangap/flashmon)
**Language:** JavaScript

Flash monitor utility for ESP32 devices.

#### [lcdmirror](https://github.com/spangap/lcdmirror)
**Language:** C++

LCD screen mirroring utility (1 fork, 2 stars as of October 2026).

#### [spangap.org](https://github.com/spangap/spangap.org)
**Language:** CSS

Static website source for spangap.org.

#### [spangap-demo](https://github.com/spangap/spangap-demo)
**Language:** TypeScript

Demonstration applications and examples.

#### [plans](https://github.com/spangap/plans)
**Language:** HTML

Planning and roadmap documentation.

## Important Documentation

### Cross-Referencing Documentation

The following texts provide deeper insight into the Spangap universe:

1. **[spangap/INTERNALS.md](https://github.com/spangap/blob/main/INTERNALS.md)** - What the Spangap build system does behind the scenes

2. **[spangap-core/docs/](https://github.com/spangap/spangap-core/tree/main/docs)** - Operator guides for core subsystems:
   - `init.md` — Platform bring-up
   - `storage.md` — Hierarchical config tree
   - `fs.md` — File system workers
   - `its.md` — Inter-Task Streaming
   - `logging.md` — Log system
   - `cli.md` — Command line interface
   - `auth.md` — Authentication primitives
   - `cron.md` — Scheduler
   - `power-management.md` — Power management
   - `memory.md` — PSRAM vs DRAM allocation

3. **[spangap-web/docs/](https://github.com/spangap/spangap-web/tree/main/docs)** - Web stack documentation:
   - `web.md` — HTTP/HTTPS server
   - `webrtc.md` — WebRTC plumbing
   - `browser-shell.md` — Browser SPA shell

4. **[spangap-net/docs/](https://github.com/spangap/spangap-net/tree/main/docs)** - Networking documentation:
   - `net.md` — WiFi/TCP/UDP state machine
   - `tls.md` — TLS server
   - `ntp.md` — Time sync
   - `mdns.md` — mDNS advertisement

5. **[spangap-lcd/docs/](https://github.com/spangap/spangap-lcd/tree/main/docs)** - Display UI documentation:
   - `shell.md` — Launcher and chrome
   - `apps.md` — App lifecycle
   - `settings.md` — Settings tree
   - `terminal.md` — VT100 terminal
   - `keyboard.md` — On-screen keyboard

6. **[Reticulous README](https://github.com/reticulous/reticulous/blob/main/README.md)** - The reference application built on Spangap. Shows how all components come together to form a full mesh networking node.

7. **[sim-mesh](https://github.com/sim-mesh/sim-mesh)** - Simulated testbed for developing and testing Reticulum networks on a single machine.

## Getting Started

The Spangap framework is designed for rapid prototyping. A minimal workflow:

```bash
# Install the spangap CLI tool
curl -fsSL https://raw.githubusercontent.com/spangap/spangap/refs/heads/main/install.sh | sh

# Initialize a workspace
spangap init my-project && cd my-project

# Build the Reticulous mesh firmware for LilyGo T-Deck
spangap build reticulous/reticulous --with spangap/hw-lilygo-tdeck

# Flash to device
spangap flash /dev/ttyUSB0
```

The platform runs on Linux, macOS, and Windows (untested). The build happens inside Docker containers, so no toolchain installation is needed on the host system.

## Licensing

Spangap is released under the **Apache 2.0 license**, making it suitable for both open source and commercial projects.

## Summary

The Spangap organization represents a unified, modular framework for ESP32 development that solves long-standing problems with multitasking, configuration synchronization, and UI development. Its straddle-based architecture allows applications to cleanly separate embedded firmware from web interfaces while sharing a common data model.

While still in early stages (alpha), Spangap has matured enough to serve as the foundation for Reticulous — a full mesh networking stack that demonstrates its capabilities with sophisticated features like real-time audio streaming, WebRTC video, LCD touch interfaces, and remote access via WireGuard.

The framework's emphasis on proper abstractions (ITS for IPC, hierarchical storage for config sync, modular straddles for code reuse) makes it particularly compelling for developers who want to build sophisticated embedded applications without reinventing the wheel.
