# Secret Sentry

## Problem

Secret scanning evidence can accidentally disclose the matched credential.

## Working decision

The demonstration returns only a rule, line, redacted preview, and fingerprint.

## Negative control

An injected-at-runtime placeholder returns no finding.

## Claim boundary

Synthetic values only. Pattern matching is not proof that every secret type is covered.
