#!/usr/bin/env sh

# this file is a fix for a very specific NixOS issue
if cat /etc/os-release | grep -q NixOS; then
        which -a biome | grep nix
else
        echo "biome"
fi
