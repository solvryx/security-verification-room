# SOLVRYX Verification Room

Five interactive, evidence-first security and quality case studies presented as a verification dossier.

## Projects

- **Agent Boundary Auditor** — correlates synthetic tool-agent trace events and reports explicit trust-boundary risks.
- **Secret Sentry** — demonstrates local secret-pattern detection with redacted previews and fingerprints.
- **Access Matrix** — compares deployed role-resource-action tuples with an approved policy.
- **Release Gate** — blocks unsafe configuration and unpinned dependencies before deployment.
- **API Contract** — returns path-level response schema drift rather than a generic validation error.

Every project includes a negative control. The demonstrations are local and use synthetic data only.

## Verification

```powershell
npm install
npm run build
npm run test:e2e
```

## Claim boundary

Self-initiated defensive case studies. They are not paid client work, a penetration test, or proof of complete vulnerability coverage.
