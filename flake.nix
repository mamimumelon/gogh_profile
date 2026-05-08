{
  description = "gogh profile sheet maker — dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_22
            pkgs.pnpm
          ];

          shellHook = ''
            echo "gogh_profile dev shell:"
            echo "  node $(node --version)"
            echo "  npm  $(npm --version)"
            echo "  pnpm $(pnpm --version)"
          '';
        };
      });
}
