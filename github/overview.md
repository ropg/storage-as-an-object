# ropg GitHub Overview

Last updated: Sun Oct 18, 2026

This document provides a comprehensive overview of all repositories under the `ropg` GitHub account. Repositories for sim-mesh, spangap and reticulous orgs have been intentionally excluded as they will be handled separately.

---

## Table of Contents

1. [Microcontroller & Embedded Systems Libraries](#microcontroller--embedded-systems-libraries)
2. [Hardware Drivers & Components](#hardware-drivers--components)
3. [Networking & Communication](#networking--communication)
4. [Web & JavaScript Tools](#web--javascript-tools)
5. [FreeBSD & Systems Administration](#freebsd--systems-administration)
6. [Python Tools & Utilities](#python-tools--utilities)
7. [Documentation & Frameworks](#documentation--frameworks)
8. [Experiments & Doodles](#experiments--doodles)

---

## Microcontroller & Embedded Systems Libraries

### `heltec_esp32_lora_v3`
**Unofficial Arduino library for Heltec ESP32 LoRa v3 boards.** Provides proper support for WiFi LoRa 32(V3), Wireless Stick(V3), and Wireless Stick Lite(V3) with embedded OLED displays, buttons, battery management, and deep sleep support. Built around RadioLib for wireless communication.

### `heltec_boards`
Arduino board manager definitions for Heltec ESP32-based boards (companion to heltec_esp32_lora_v3).

### `RadioLib`
**Fork** of the popular Universal wireless communication library for embedded devices. Supports LoRa, FSK, OOK, and various transceivers (SX12xx, RF69, CC1101).

### `LoRaWAN_ESP32`
ESP32-specific persistence library for RadioLib LoRaWAN endpoints. Manages session state during deep sleep and provides provisioning data handling for OTAA joins.

### `atom2radio`
Adapter board and documentation to connect M5Atom/M5AtomS3 ESP32 units with common 2x4 pin header radio boards (CC1101, etc.).

### `OOKwiz`
On/Off Keying (OOK) ESP32 Arduino library for receiving, analyzing, decoding, encoding, and transmitting radio remote control signals. Used with CC1101, SX127x, RF69, and other OOK radios. Includes CLI interface.

### `heltec_esp32_lora_v3`
Unofficial Arduino library for Heltec ESP32 LoRa v3 boards. Complete support for WiFi LoRa 32(V3), Wireless Stick(V3), and Wireless Stick Lite(V3).

---

## Hardware Drivers & Components

### `ssd1306`
**Fork** of SSD1306/SH1106 OLED display driver for ESP8266/ESP32.

### `lvgl`
**Fork** of LVGL (Light and Versatile Graphics Library) - powerful embedded GUI library with widgets, animations, and low memory footprint.

### `lvgl_esp32_drivers`
**Fork** of ESP32 drivers for LVGL - display and touchpad drivers including XPT2046, FT3236, ST7789, ILI9341, SSD1306.

### ` LovyanGFX`
**Fork** of SPI LCD graphics library for ESP32, SAMD51. Supports ILI9341, ST7789, and other controllers.

### `spi_lcd_read`
Tiny library to read LCD controller registers (ILI9341, ST7789) via SPI. Used for auto-detecting display controllers.

### `LVGL_CYD`
Arduino library for Cheap Yellow Display (CYD) ESP32 boards with LVGL. Auto-detects board variant, includes modified touch drivers for both resistive and capacitive screens.

### `m5core2_adf`
ESP-ADF audio component for M5Stack Core2. Provides working audio input/output with microphone support and full-duplex limitations documented.

### `m5core2_axp192`
M5Stack Core2 AXP192 power management IC driver for ESP-IDF.

### `ESP32_RTC_EEPROM`
EEPROM emulation using ESP32 RTC RAM instead of flash. Survives deep sleep (but not reset/power-cycle). Optional NVS backup.

### `i2c_manager`
Thread-safe I2C bus communication ESP-IDF component.

---

## Networking & Communication

### `ratdeck`
**Reticulum for LilyGo T-Deck Plus.** Standalone Reticulum node with LXMF messaging over LoRa, TCP WiFi bridging, node discovery, and identity management.

### `ipocalypse`
HOWTO for using fewer IPv4 addresses on FreeBSD servers with jails. Uses NAT, port forwarding, and Apache reverse proxy setup to serve multiple web services on limited IPv4.

### `openwrt`
**Mirror** of OpenWRT repository. For reference only; not active for check-ins.

### `pfedit`
FreeBSD `/etc/pf.conf` editor with auto-revert protection to prevent locking yourself out when editing firewall rules.

---

## Web & JavaScript Tools

### `litegraph.js`
**Fork** of LiteGraph - graph node engine and editor in JavaScript (similar to PD or UDK Blueprints). Can run client-side or server-side (Node.js).

### `zhot`
Shell around Puppeteer for easy web screenshots. Can capture single elements, execute JavaScript, handle cookies.

### `tweetzhot`
Screenshots of single tweets/replies using zhot internally. Command-line tool and API for tweet screenshots.

### `storage-as-an-object`
`localStorage`/`sessionStorage` wrapper that stores objects while preserving types (including Date). Automatic JSON serialization.

### `compressedstorage`
Transparent proxy to compress data in localStorage/sessionStorage using LZ-string.

### `local-session-storage-proxy`
ES6 Proxy-based wrapper for localStorage/sessionStorage that acts like an object.

### `uniqarray`
Array subclass that only holds unique values. Supports push/unshift/concat while preventing duplicates.

### `klipz`
**Repository:** klipz (no README found)

---

## FreeBSD & Systems Administration

### `ipocalypse`
HOWTO for using fewer IPv4 addresses on FreeBSD servers with jails. Uses NAT, port forwarding, and Apache reverse proxy.

### `pfedit`
FreeBSD `/etc/pf.conf` editor with auto-revert protection to prevent locking yourself out when editing firewall rules.

---

## Python Tools & Utilities

### `wrtview`
 displays host data on networks centered around OpenWRT routers. Combines ARP, DHCP, hosts, ethers files and `iw station dump` output.

### `SARveillance`
Sentinel-1 SAR time series analysis for OSINT use. Generates time-lapse GIFs of satellite imagery.

### `SVESADS`
Simple Visual Emergency Signal for Automated Detection from Space (project website screenshot tool).

### `python-evdev`
**Fork** of Python bindings for Linux input subsystem (event devices, keyboards, mice, gamepads).

---

## Documentation & Frameworks

### `truetype2gfx`
Font conversion tool from TrueType to Adafruit GFX format.

### `breathe`
**Fork** of ReStructuredText and Sphinx bridge to Doxygen.

### `jekyll-now`
**Fork** of Jekyll boilerplate for creating blogs without command-line interaction.

### `cert-covid19`
German-language information collection about CoVid-19 (archived).

---

## Experiments & Doodles

### `board_experiments`
Heltec board definitions for Arduino board manager (companion to heltec_esp32_lora_v3).

### `board_definitions`
Arduino board definitions for ESP32 cores and libraries.

### `library-registry`
**Fork** of Arduino Library Manager registry list (repositories.txt).

### `m5core2_esp-idf_demo`
M5Stack Core2 basic example with plain ESP-IDF (no Arduino framework).

### `m5core2_adf`
M5Stack Core2 ESP-ADF audio component for ESP-IDF.

### `m5core2_axp192`
M5Stack Core2 AXP192 power management IC driver.

### `pager`
**Repository:** pager (no README found)

### `ledz`
LED displays using LPD8806 addressable LEDs.

---

## Libraries in Active Development

The following are foundational libraries maintained by ropg:

| Library | Purpose |
|---------|---------|
| `HotButton` | Arduino button library with event detection (single/double/long press) |
| `ezTime` | Easy-to-use Arduino time/date library with NTP, timezone support |
| `EEPROM emulation (RTC)` | ESP32 EEPROM emulation in RTC RAM |
| `spi_lcd_read` | Low-level SPI LCD register reader |
| `i2c_manager` | Thread-safe I2C communication |

---

## Frameworks & Large Dependencies

| Project | Purpose |
|---------|---------|
| `lvgl` | Embedded graphics library (forked) |
| `arduino-esp32` | ESP32 Arduino core (forked, very early) |
| `openwrt` | OpenWRT firmware (mirror only) |

---

## Patterns & Observations

### Fork Strategy
Most repositories are forks of upstream projects with specific adaptations:
- **Hardware-specific**: `heltec_esp32_lora_v3`, `ssd1306`, `lvgl_esp32_drivers` - adaptations for specific ESP32-based hardware
- **Protocol-specific**: `RadioLib`, `OOKwiz`, `LoRaWAN_ESP32` - extensions for wireless communication
- **Platform-specific**: `openwrt`, `m5core2_adf` - adaptations for specific platforms (OpenWRT, M5Stack)

### Toolchain Patterns
Several tools solve repetitive workflows:
- **DNS management**: `zfht` tracks `$INCLUDE` dependencies and serial updates
- **Firewall safety**: `pfedit` prevents locking out by requiring double-confirm and auto-reverting
- **System monitoring**: `wrtview` aggregates OpenWRT data sources into single display

### Library Dependencies
Many libraries serve as foundational building blocks:
- `HotButton` - button handling for one-button devices
- `ezTime` - time/date with NTP and timezone support
- `spi_lcd_read` - hardware detection before driver initialization

### Code Organization
Most repositories follow a "single-purpose" pattern:
- Each repo solves one problem well
- Little inter-dependency between repos (each is independently installable)
- READMEs emphasize getting started quickly over comprehensive docs

### Documentation Gaps
Some repos lack proper documentation:
- `board_experiments`, `board_definitions` - READMEs are minimal
- `klipz`, `pager`, `m5core2_axp192` - no README found
- Some forks inherit upstream docs but lack local modifications documentation

---

## Cleanup Checklist (for upcoming repo cleanup)

- [ ] Remove duplicate repos (`heltec_esp32_lora_v3` appears twice)
- [ ] Remove mirrors of inactive projects (`openwrt`)
- [ ] Add READMEs to repos missing them
- [ ] Delete or archive abandoned repos (`klipz`, `pager`)
- [ ] Standardize documentation format across all repos
- [ ] Add contributing guidelines where applicable
- [ ] Review fork history and consider upstreaming changes

---

*Generated automatically from GitHub API calls, with patterns added Oct 18, 2026*
