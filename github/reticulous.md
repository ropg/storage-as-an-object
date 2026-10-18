# Reticulous GitHub Organization

## Overview

The **Reticulous** organization on GitHub hosts the complete ecosystem for running [Reticulum](https://reticulum.network) mesh networking on ESP32 microcontrollers. Reticulum is Mark Qvist's cryptographic, store-and-forward mesh networking stack that works over LoRa, packet radio, TCP/IP, and other transports. Reticulous adapts this for embedded systems by building on top of the **Spangap Device Application Framework**, providing a full-featured mesh node with LXMF messaging, Nomad Network browsing, remote management, and LCD support.

The Reticulous universe consists of two complementary components:

1. **The Spangap Platform** (`spangap/` org) - A unified framework for ESP32 development providing proper multitasking, hierarchical configuration sync between device and browser, and unified web/LCD interfaces through a modular "straddle" architecture.

2. **The Reticulum Stack** (`reticulous/` org) - The actual mesh networking implementation built on Spangap, containing the RNS protocol engine, multiple interface types (LoRa, TCP, ESP-NOW, AutoInterface), LXMF messaging, Nomad Network browsing, remote shell (rnsh), and supporting tools.

Reticulous represents the reference implementation of what Spangap can achieve — it is both a fully operational mesh networking node and a demonstration of the framework's capabilities.

---

## Core Reticulous Repositories

### [reticulous](https://github.com/reticulous/reticulous)

The main buildable straddle that assembles a complete Reticulum node. It carries no firmware or board code itself but brings together all the necessary straddles (the RNS stack, interfaces, messaging, browsing) plus the Spangap platform and a specific board (e.g., LilyGo T-Deck, Heltec V4) to produce a complete firmware image. The buildable ships the browser SPA, LittleFS data image, LCD icons, and the on-device welcome manual. You build it *with* a board straddle using `spangap build reticulous/reticulous --with spangap/hw-lilygo-tdeck`.

### [rns](https://github.com/reticulous/rns)

The heart of Reticulum on the device: the `rnsd` task that owns the entire protocol state. This straddle ports and extends microReticulum to run on ESP-IDF/FreeRTOS, handling identity management, destinations, the path table, Transport state machine, Links, Resources, and Channels. It exposes a clean byte-array C API (`rnsd.h`) to consumers without exposing internal µR types. The stack is completely decoupled from any specific radio or network interface — interfaces plug in via ITS (Inter-Task Streaming) IPC.

### [iface-lora](https://github.com/reticulous/iface-lora)

LoRa interface for Reticulum using RadioLib. Supports SX126x, SX127x, SX128x, LR11x0, and LR2021 chips via SPI. The interface registers with rnsd as a dedicated RNS interface, handling HDLC-framed packet transmission over the LoRa radio. It implements proper congestion control and coexists with other interface types.

### [iface-tcp](https://github.com/reticulous/iface-tcp)

TCP/IP interface for Reticulum with both client (outbound) and server (inbound) capabilities. Supports HDLC-framed communication compatible with upstream Reticulum's TCP interfaces, including IFAC (Interface Access Codes) for network authentication. The implementation uses spangap-net's TCP sockets and registers each connection as its own interface with unique naming (`tcp/<id>` for outbound, `tcp_in/<addr>#<slot>` for inbound).

### [iface-espnow](https://github.com/reticulous/iface-espnow)

ESP-NOW interface using Espressif's long-range PHY. Every RNS packet maps 1:1 to one ESP-NOW frame, using a 4-byte magic prefix (`"RNS"` + framing version) to distinguish Reticulum traffic from other ESP-NOW traffic on the same 2.4 GHz channel. Supports both 250k and 500k long-range rates.

### [iface-auto](https://github.com/reticulous/iface-auto)

Zero-configuration AutoInterface for local WiFi LAN. Automatically discovers other Reticulum nodes on the same subnet using IPv6 link-local multicast, then exchanges data over unicast UDP. Wire-compatible with upstream Reticulum's AutoInterface using the same group name (default: "reticulum"), well-known ports (29716/29717/42671), and peer-token exchange.

### [lxmf](https://github.com/reticulous/lxmf)

LXMF messaging implementation for Reticulum on ESP32. Provides a full-featured mailbox supporting up to four independent identities, signed messages with proof-of-work stamps, reliable Channels over Links for large messages, propagation node support, and interoperability with Sideband/NomadNet/MeshChat. Built from scratch in C++ against the Python reference (LXMF 0.9.8), with the entire stack built over rnsd's byte-array API.

### [nomad](https://github.com/reticulous/nomad)

Nomad Network "text web" client for browsing pages and files hosted on `nomadnetwork.node` destinations. Implements a complete Micron parser/renderer and session-based browsing with page caching, form submission, bookmark management, and identification support (browse as specific identity). Builds on rnsd's Link request/response API rather than LXMF.

### [rnsh](https://github.com/reticulous/rnsh)

Reticulum remote shell (server and client). The server advertises an `rnsh` destination on the mesh, accepts inbound Channels, and bridges them to the device's CLI behind an admin-password login gate. The client dials remote nodes over Reticulum Links and relays an interactive terminal session. Wire-compatible with upstream `rnsh` (acehoss) using the same protocol version.

### [netgraph](https://github.com/reticulous/netgraph)

Distributed network graph visualization tool. Reads the path table and interface state locally, then crawls other nodes over their management service to collect their tables as well. Combines four evidence classes (route1, route2, heard, record) into a unified graph displayed in the browser's NetGraph dock app. Implements a custom encoding format for exchanging node information and supports community-based encryption for management announces.

### [maps](https://github.com/reticulous/maps)

Offline slippy map viewer for LCD devices. Blits pre-baked JPEG or raw RGB565 tiles from SD card centred on GPS coordinates, with drag-to-pan and pinch/button zoom. The heavy rendering happens on a workstation using the included `tilebake` toolchain; the device only reads, decodes, and displays. Uses LVGL for the UI and GPS from ephemeral storage keys.

### [spangap.org](https://github.com/reticulous/spangap.org)

Static website source for spangap.org, the documentation and landing page for both Spangap and Reticulous.

---

## Important Documentation

The following texts provide deeper insight into the Reticulous universe:

1. **[spangap/README.md](https://github.com/spangap)** - Spangap organization overview and architecture description

2. **[spangap/INTERNALS.md](https://github.com/spangap/blob/main/INTERNALS.md)** - What the Spangap build system does behind the scenes

3. **[rns/README.md](https://github.com/reticulous/rns/blob/main/README.md)** - Comprehensive guide to the Reticulum stack on device, covering `rnsd`, ITS ports, storage variables, announce tick, the service radius, neighbourhood tables, directory management, and remote management

4. **[rns/INTERNALS.md](https://github.com/reticulous/rns/blob/main/INTERNALS.md)** - Implementation details of the microReticulum fork, ITS ports map, Channel support, and maintainer pitfalls

5. **[lxmf/README.md](https://github.com/reticulous/lxmf/blob/main/README.md)** - Complete LXMF messaging guide covering identities, sending/receiving messages, delivery modes, stamps, propagation nodes, being proxied, ping functionality, and status/proofs

6. **[nomad/README.md](https://github.com/reticulous/nomad/blob/main/README.md)** - Nomad Network client guide covering page navigation, form submission, bookmarks, identification, and Micron parsing

7. **[rnsh/README.md](https://github.com/reticulous/rnsh/blob/main/README.md)** - Remote shell documentation covering server/client operation, admission control, colour support, and upstream interop

8. **[netgraph/README.md](https://github.com/reticulous/netgraph/blob/main/README.md)** - Network graph documentation covering the four evidence classes, record format, crawl mechanism, community encryption, and force-directed layout

9. **[iface-lora/README.md](https://github.com/reticulous/iface-lora)** - LoRa interface documentation covering RadioLib integration and configuration

10. **[iface-tcp/README.md](https://github.com/reticulous/iface-tcp)** - TCP interface documentation covering HDLC framing, peer lifecycle, IFAC, and server configuration

11. **[iface-espnow/README.md](https://github.com/reticulous/iface-espnow)** - ESP-NOW interface documentation covering the long-range PHY and channel-conflict policy

12. **[iface-auto/README.md](https://github.com/reticulous/iface-auto)** - AutoInterface documentation covering IPv6 multicast discovery and wire compatibility

13. **[maps/README.md](https://github.com/reticulous/maps)** - Offline map viewer documentation and tilebake toolchain guide

14. **[sim-mesh](https://github.com/sim-mesh/sim-mesh)** - Simulated testbed for developing and testing Reticulum networks on a single machine

---

## Getting Started

To build and flash a complete Reticulous node:

```bash
# Install the spangap CLI tool
curl -fsSL https://raw.githubusercontent.com/spangap/spangap/refs/heads/main/install.sh | sh

# Initialize a workspace
spangap init my-rns && cd my-rns

# Build the Reticulous mesh firmware for LilyGo T-Deck
spangap build reticulous/reticulous --with spangap/hw-lilygo-tdeck

# Flash to device
spangap flash /dev/ttyUSB0

# Monitor serial output
spangap monitor /dev/ttyUSB0
```

The build happens inside Docker containers, requiring only Docker, git, and Python 3 on the host system.

---

## Licensing

Reticulous is released under the **Apache 2.0 license**, making it suitable for both open source and commercial projects.

---

## Summary

The Reticulous organization represents a complete mesh networking solution for ESP32 microcontrollers, implementing the Reticulum protocol stack with full support for LoRa, TCP/IP, ESP-NOW, and WiFi AutoInterface. Built on top of the Spangap framework, it provides:

- **Cryptographic security** - End-to-end encrypted Links by default
- **Store-and-forward messaging** - LXMF with support for multiple identities and propagation nodes  
- **Web browsing over mesh** - Nomad Network compatible pages
- **Remote shell access** - rnsh for CLI over encrypted Links
- **Network visualization** - netgraph showing the complete mesh topology
- **Offline maps** - GPS-centred map viewer with tile caching
- **Multiple interface support** - LoRa, TCP, ESP-NOW, WiFi AutoInterface

The project demonstrates the power of the Spangap framework while providing a fully functional mesh node ready for real-world deployment.
