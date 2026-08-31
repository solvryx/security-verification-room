# Release Gate

## Problem

A successful build can still contain unsafe runtime configuration.

## Working decision

The demonstration blocks default secrets, debug mode, wildcard CORS, and unpinned dependencies.

## Negative control

A hardened synthetic configuration passes the same rule set.

## Claim boundary

The example is an explainable control set, not a complete secure-release certification.
