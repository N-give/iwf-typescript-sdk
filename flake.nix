{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in {
        packages = {
          default = pkgs.buildNpmPackage {
            name = "iwf-typescript-sdk";
            buildInputs = with pkgs; [
              nodejs_latest
              openapi-generator-cli
              typescript
            ];
            src = self;
            npmDeps = pkgs.importNpmLock {
              npmRoot = ./.;
            };
            buildPhase = ''
              npm run build:all
            '';
            installPhase = ''
              mkdir $out
              cp -r node_modules $out/node_modules
              cp package.json $out/package.json
              cp -r dist $out/dist
            '';
          };
        };

        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            deno
            nodejs
            openapi-generator-cli
            typescript
            typescript-language-server
          ];

          shellHook = ''
            ./scripts/setup.sh
          '';
        };
      }
    );
}
