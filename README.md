# Tshet-uinh Deriver

[中文](./README-zh.md)

Tshet-uinh Deriver is an online linguistic tool for generating phonological reconstructions of the Qieyun system, as well as extrapolated historical and modern phonological systems derived from it.

This tool is part of the nk2028 organisation’s suite of computational linguistics projects, which aim to advance research in historical Chinese phonology and beyond.

## Try It Online

The tool is available as a web-based interface at <https://nk2028.shn.hk/tshet-uinh-deriver/>.

## nk2028 Libraries Used

- [tshet-uinh-js](https://github.com/nk2028/tshet-uinh-js): The core library, providing phonological position data and query interfaces for the Qieyun system.
- [tshet-uinh-examples](https://github.com/nk2028/tshet-uinh-examples): A repository of example derivation scripts covering a wide range of historical and modern phonological systems, for direct use or reference.
- [tshet-uinh-deriver-tools](https://github.com/nk2028/tshet-uinh-deriver-tools): A tooling library that encapsulates the runtime logic of derivation schemes and handles option configuration and parameter management.
- [tshet-uinh-text-label](https://github.com/nk2028/tshet-uinh-text-label): A repository of preset annotated texts that users can load with one click to quickly preview derivation output.
- [yitizi](https://github.com/nk2028/yitizi): A variant character database used to map variant forms in input text to their canonical equivalents, ensuring correct phonological lookups.

## Features

1. Supports derivation scripts for a wide range of historical and modern phonological systems, as well as user-defined custom scripts
1. English and Chinese UI
1. Preset texts that can be loaded with one click to conveniently preview derivation output
1. Side-by-side comparison of multiple derivation schemes per phonological position
1. Variant character normalisation in input text
1. Manual selection of readings for polyphonic characters based on their definitions
1. (Planned) Automatic prediction of the most likely reading for polyphonic characters
