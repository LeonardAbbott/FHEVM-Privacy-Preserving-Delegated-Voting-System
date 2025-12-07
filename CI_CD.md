# CI/CD Pipeline Documentation

Comprehensive guide for the Continuous Integration and Continuous Deployment pipeline for the Privacy-Preserving Delegated Voting System.

---

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Code Quality Tools](#code-quality-tools)
4. [Running CI/CD Locally](#running-cicd-locally)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The project uses GitHub Actions for automated testing, linting, coverage reporting, and deployment validation. All workflows run automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`
- Multiple Node.js versions (18.x, 20.x)

### CI/CD Pipeline Features

✅ **Automated Testing** - Runs 54 comprehensive tests
✅ **Code Linting** - Solhint for Solidity code quality
✅ **Code Coverage** - Codecov integration with reporting
✅ **Gas Reporting** - Gas usage analysis for optimizations
✅ **Security Audits** - npm audit for vulnerability checking
✅ **Multi-Version Testing** - Node.js 18.x and 20.x
✅ **Artifact Management** - Test results and coverage reports

---

## GitHub Actions Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Purpose**: Basic test execution on multiple Node.js versions

**Triggers**:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs**:
```yaml
test:
  - Setup Node.js (18.x, 20.x)
  - Install dependencies (npm ci)
  - Compile contracts
  - Run tests (54 tests)
  - Upload test results as artifacts
```

**Runs on**: Ubuntu Latest

**Matrix Strategy**: Tests on both Node.js 18.x and 20.x simultaneously

### 2. Comprehensive CI Workflow (`.github/workflows/ci.yml`)

**Purpose**: Full CI/CD pipeline with quality checks

**Triggers**: Same as test workflow

**Jobs Pipeline**:

#### Job 1: Lint
```yaml
lint:
  - Checkout code
  - Setup Node.js 20.x
  - Install dependencies
  - Run Solhint on contracts
  - Check code formatting
```

#### Job 2: Compile
```yaml
compile:
  - Checkout code
  - Setup Node.js 20.x
  - Install dependencies
  - Compile all contracts
  - Upload compiled artifacts
```
**Depends on**: `lint`

#### Job 3: Test (Matrix)
```yaml
test:
  - Run on Node.js 18.x and 20.x
  - Execute all 54 tests
  - Generate test reports
  - Upload test results
```
**Depends on**: `compile`

#### Job 4: Coverage
```yaml
coverage:
  - Run test coverage analysis
  - Generate coverage report
  - Upload to Codecov
  - Store coverage artifacts
```
**Depends on**: `compile`

#### Job 5: Gas Report
```yaml
gas-report:
  - Generate gas usage report
  - Upload gas report artifact
```
**Depends on**: `compile`

#### Job 6: Security
```yaml
security:
  - Run npm audit
  - Check for vulnerabilities
  - Report security issues
```
**Depends on**: `compile`

#### Job 7: Build Summary
```yaml
build-summary:
  - Collect all job results
  - Display pipeline status
  - Fail if critical jobs failed
```
**Depends on**: All previous jobs

---

## Code Quality Tools

### Solhint Configuration

**File**: `.solhint.json`

**Rules Enabled**:
- Code complexity limit: 10
- Compiler version: ^0.8.20
- Function visibility enforcement
- Max line length: 120 characters
- Custom error usage (gas optimization)
- NatSpec documentation requirements
- Naming conventions
- Import ordering

**Usage**:
```bash
# Run linting
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Configuration**:
```json
{
  "extends": "solhint:recommended",
  "rules": {
    "code-complexity": ["error", 10],
    "compiler-version": ["error", "^0.8.20"],
    "func-visibility": ["error", { "ignoreConstructors": true }],
    "max-line-length": ["warn", 120]
  }
}
```

### Codecov Integration

**File**: `codecov.yml`

**Features**:
- Coverage precision: 2 decimal places
- Target coverage: 80% for project, 75% for patches
- Auto-comment on PRs with coverage changes
- Ignore test and script directories

**Usage**:
- Automatically runs in CI pipeline
- Reports uploaded to Codecov dashboard
- PR comments show coverage impact

**Configuration**:
```yaml
coverage:
  status:
    project:
      target: 80%
    patch:
      target: 75%
```

---

## Running CI/CD Locally

### Prerequisites

```bash
# Install dependencies
npm install

# Ensure you have Node.js 18.x or 20.x
node --version
```

### Run All Checks Locally

#### 1. Linting
```bash
# Run Solhint
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

#### 2. Compilation
```bash
# Clean and compile
npm run clean
npm run compile
```

#### 3. Testing
```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage
```

#### 4. Security Audit
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Complete Local CI Check

```bash
# Full CI simulation
npm run lint && \
npm run compile && \
npm test && \
npm run test:coverage && \
npm audit
```

---

## Configuration

### Environment Variables

No environment variables required for CI/CD to run. The following are optional:

#### GitHub Secrets (for Codecov)

Add to repository secrets:

```
CODECOV_TOKEN=your-codecov-token
```

**How to get Codecov token**:
1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Copy the upload token from settings
4. Add to GitHub repository secrets

### GitHub Actions Permissions

The workflows use minimal permissions:

```yaml
permissions:
  contents: read
```

For PR comments or status checks, you may need:
```yaml
permissions:
  contents: read
  pull-requests: write
  statuses: write
```

---

## Workflow Status Badges

Add to your README.md:

```markdown
![Test Suite](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Test%20Suite/badge.svg)
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

---

## Artifacts

### Test Results Artifacts

**Retention**: 7 days

**Contents**:
- Test execution logs
- Coverage reports
- Gas usage reports

**Download**:
1. Go to GitHub Actions tab
2. Select workflow run
3. Download artifacts from "Artifacts" section

### Coverage Artifacts

**Retention**: 30 days

**Contents**:
- HTML coverage report
- LCOV coverage data
- Coverage summary

---

## Troubleshooting

### Issue 1: Workflow Fails on Lint

**Symptom**: Solhint fails with errors

**Solution**:
```bash
# Run locally to see errors
npm run lint

# Auto-fix where possible
npm run lint:fix

# Review remaining issues manually
```

### Issue 2: Tests Timeout

**Symptom**: Tests timeout in CI

**Solution**:
```javascript
// Increase timeout in test files
it("test name", async function () {
  this.timeout(60000); // 60 seconds
  // test code
});
```

### Issue 3: Coverage Upload Fails

**Symptom**: Codecov upload fails

**Solutions**:
- Check `CODECOV_TOKEN` is set in GitHub secrets
- Verify repository is connected to Codecov
- Check coverage file exists: `coverage/lcov.info`

### Issue 4: Node Version Mismatch

**Symptom**: Different behavior in CI vs local

**Solution**:
```bash
# Use nvm to match CI version
nvm install 20
nvm use 20

# Or test both versions locally
nvm use 18 && npm test
nvm use 20 && npm test
```

### Issue 5: Dependency Installation Fails

**Symptom**: npm ci fails in CI

**Solution**:
```bash
# Update package-lock.json
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
```

---

## Best Practices

### 1. Keep Dependencies Updated

```bash
# Check outdated packages
npm outdated

# Update packages safely
npm update

# Update major versions carefully
npm install package@latest
```

### 2. Write Tests First

- Add tests before pushing code
- Ensure all tests pass locally
- Maintain >80% coverage

### 3. Review Lint Warnings

- Fix critical errors before pushing
- Address warnings gradually
- Configure rules as needed

### 4. Monitor CI Performance

- Check workflow execution times
- Optimize slow tests
- Use caching effectively

### 5. Security First

- Run `npm audit` regularly
- Update vulnerable dependencies
- Review security warnings

---

## Extending the Pipeline

### Adding New Workflows

Create new workflow file:

```yaml
# .github/workflows/custom.yml
name: Custom Workflow

on:
  push:
    branches: [main]

jobs:
  custom-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      - run: npm ci
      - run: npm run custom-command
```

### Adding Deployment Jobs

```yaml
deploy:
  name: Deploy to Testnet
  runs-on: ubuntu-latest
  needs: [test, coverage]
  if: github.ref == 'refs/heads/main'

  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm run deploy:sepolia
      env:
        PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
        SEPOLIA_URL: ${{ secrets.SEPOLIA_URL }}
```

### Adding Notifications

```yaml
notify:
  name: Notify on Failure
  runs-on: ubuntu-latest
  needs: [test]
  if: failure()

  steps:
    - name: Send notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'CI Pipeline Failed!'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Metrics and Monitoring

### GitHub Actions Metrics

View in repository:
- **Actions tab** → Workflow runs
- **Insights** → Pulse (activity summary)
- **Settings** → Actions (usage limits)

### Coverage Trends

View on Codecov:
- Coverage percentage over time
- File-by-file coverage
- PR coverage impact
- Commit coverage history

### Gas Usage Trends

Monitor from artifacts:
- Download `gas-report` from workflow runs
- Compare gas costs across commits
- Identify gas-intensive operations

---

## Summary

The CI/CD pipeline provides:

✅ **Automated Quality Checks** - Every commit is validated
✅ **Multi-Version Testing** - Node.js 18.x and 20.x
✅ **Coverage Monitoring** - Track test coverage trends
✅ **Gas Optimization** - Monitor gas usage
✅ **Security Scanning** - Automated vulnerability detection
✅ **Artifact Storage** - Test results and reports saved

All workflows run automatically on push and pull requests, ensuring code quality and preventing regressions.

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Solhint Documentation](https://github.com/protofire/solhint)
- [Codecov Documentation](https://docs.codecov.com)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)

---

**For questions or issues with CI/CD, check the workflow logs in the Actions tab of your repository.**
