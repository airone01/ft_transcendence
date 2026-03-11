{
  description = "ft_transcendence flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            biome
            nodejs
            playwright-driver.browsers
          ];

          shellHook = ''
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          '';
        };
      }
    );
}
