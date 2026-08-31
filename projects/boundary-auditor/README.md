# Agent Boundary Auditor

## Problem

Tool-agent traces hide the boundary where untrusted input or protected data reaches a state-changing action.

## Working decision

The local demonstration correlates ordered synthetic events and identifies explicit protected-source and missing-approval paths.

## Negative control

A benign trace with approval evidence returns zero findings.

## Claim boundary

Read-only, synthetic demonstration. It does not execute tools, replay traces, or claim complete attack detection.
