# CLAUDE.md - AI Assistant Guide for ttya

This document provides comprehensive guidance for AI assistants working on the ttya codebase. It documents the project structure, development workflows, conventions, and best practices.

## Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Development Workflow](#development-workflow)
- [Code Conventions](#code-conventions)
- [Git Practices](#git-practices)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**Repository:** ttya
**Owner:** CK23-byte
**Status:** New project initialization

### Purpose

This repository is currently in its initial setup phase. The project structure and conventions outlined in this document should be followed as the codebase evolves.

### Technology Stack

To be determined based on project requirements. Update this section when:
- Programming language(s) are chosen
- Framework(s) are selected
- Key dependencies are added
- Build tools are configured

---

## Repository Structure

### Recommended Directory Layout

```
ttya/
├── .git/                 # Git repository metadata
├── .github/              # GitHub-specific files
│   ├── workflows/        # CI/CD workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
├── src/                  # Source code
│   ├── core/            # Core functionality
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── docs/                # Documentation
│   ├── api/            # API documentation
│   ├── guides/         # User guides
│   └── architecture/   # Architecture docs
├── scripts/             # Build and utility scripts
├── .gitignore          # Git ignore patterns
├── README.md           # Project README
├── CLAUDE.md           # This file
├── CONTRIBUTING.md     # Contribution guidelines
└── LICENSE             # Project license
```

### Key Directories

- **src/**: All production source code
- **tests/**: All test files (mirror src/ structure)
- **docs/**: Project documentation
- **scripts/**: Automation and build scripts

---

## Development Workflow

### Branch Strategy

**Main Branches:**
- `main` (or `master`): Production-ready code
- `develop`: Integration branch for features

**Feature Branches:**
- Pattern: `feature/<descriptive-name>`
- Example: `feature/user-authentication`

**Claude AI Branches:**
- Pattern: `claude/<session-identifier>`
- These are temporary branches for AI-assisted development
- Should be merged via PR and deleted after merge

**Bugfix Branches:**
- Pattern: `bugfix/<issue-number>-<description>`
- Example: `bugfix/123-fix-login-error`

**Hotfix Branches:**
- Pattern: `hotfix/<version>-<description>`
- Example: `hotfix/1.2.1-security-patch`

### Development Process

1. **Start New Feature:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **Make Changes:**
   - Write code following conventions
   - Add tests for new functionality
   - Update documentation

3. **Commit Changes:**
   - Use clear, descriptive commit messages
   - Follow commit message conventions (see below)

4. **Push and Create PR:**
   ```bash
   git push -u origin feature/new-feature
   # Create PR via GitHub UI or CLI
   ```

5. **Code Review:**
   - Address feedback
   - Ensure CI passes
   - Obtain approvals

6. **Merge:**
   - Squash and merge or regular merge based on team preference
   - Delete feature branch after merge

---

## Code Conventions

### General Principles

1. **Clarity Over Cleverness:** Write code that is easy to understand
2. **DRY (Don't Repeat Yourself):** Extract common functionality
3. **SOLID Principles:** Follow object-oriented design principles
4. **Consistent Formatting:** Use automated formatters (e.g., Prettier, Black, gofmt)

### Naming Conventions

**Variables:**
- Use descriptive names: `userProfile` not `up`
- Boolean variables: `isActive`, `hasPermission`, `canEdit`
- Arrays/Lists: Use plural: `users`, `items`, `records`

**Functions/Methods:**
- Use verbs: `getData()`, `calculateTotal()`, `validateInput()`
- Be specific: `getUserById()` not `get()`

**Classes:**
- Use PascalCase: `UserManager`, `DataProcessor`
- Noun-based names: `User`, `Order`, `PaymentService`

**Constants:**
- Use UPPER_SNAKE_CASE: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

**Files:**
- Match class/module name: `UserManager.js`, `data_processor.py`
- Use kebab-case for multi-word files: `user-service.js`

### Code Organization

**File Structure:**
```javascript
// 1. Imports (third-party first, then local)
import React from 'react';
import { useState } from 'react';
import { UserService } from './services/user-service';

// 2. Constants
const MAX_ITEMS = 100;

// 3. Types/Interfaces (if applicable)
interface User {
  id: string;
  name: string;
}

// 4. Main code (functions, classes, components)
export class UserManager {
  // ...
}

// 5. Exports
export default UserManager;
```

### Comments

**When to Comment:**
- Complex algorithms or business logic
- Non-obvious decisions ("Why" not "What")
- TODO/FIXME markers with context
- API documentation (JSDoc, docstrings, etc.)

**When NOT to Comment:**
- Obvious code that explains itself
- Commented-out code (remove it, use git history)

**Example:**
```javascript
// Good: Explains WHY
// Using binary search because dataset can exceed 10M records
const result = binarySearch(data, target);

// Bad: Explains WHAT (obvious from code)
// Loop through users
for (const user of users) {
  // ...
}
```

---

## Git Practices

### Commit Message Format

Use the conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```
feat(auth): add JWT authentication

Implement JWT-based authentication for API endpoints.
Includes token generation, validation, and refresh logic.

Closes #123

---

fix(user): resolve null pointer in getUserById

Added null check before accessing user properties.

---

docs(readme): update installation instructions
```

### Commit Best Practices

1. **Atomic Commits:** One logical change per commit
2. **Meaningful Messages:** Clear, descriptive commit messages
3. **Test Before Commit:** Ensure code compiles and tests pass
4. **Small Commits:** Easier to review and revert if needed

### What NOT to Commit

- Secrets (API keys, passwords, tokens)
- Large binary files (use Git LFS if needed)
- Generated files (build artifacts, compiled code)
- IDE-specific files (add to .gitignore)
- node_modules, vendor directories
- .env files (use .env.example instead)

### .gitignore Template

```gitignore
# Dependencies
node_modules/
vendor/
*.egg-info/

# Build outputs
dist/
build/
*.o
*.pyc
__pycache__/

# Environment
.env
.env.local
*.secret

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
logs/

# Testing
coverage/
.nyc_output/
```

---

## Testing Guidelines

### Testing Principles

1. **Test Pyramid:**
   - Many unit tests (70%)
   - Some integration tests (20%)
   - Few e2e tests (10%)

2. **Test Coverage:**
   - Aim for 80%+ code coverage
   - 100% coverage for critical paths
   - Focus on edge cases and error conditions

3. **Test Naming:**
   - Descriptive: `test_user_login_with_invalid_password`
   - Use `should` or `it should`: `should return error when email is invalid`

### Test Structure

**AAA Pattern (Arrange-Act-Assert):**
```javascript
test('should calculate total price correctly', () => {
  // Arrange
  const cart = new ShoppingCart();
  cart.addItem({ price: 10, quantity: 2 });
  cart.addItem({ price: 5, quantity: 3 });

  // Act
  const total = cart.calculateTotal();

  // Assert
  expect(total).toBe(35);
});
```

### What to Test

**DO Test:**
- Public APIs and interfaces
- Edge cases (empty inputs, null, negative numbers)
- Error conditions and exceptions
- Business logic and calculations
- Integration points

**DON'T Test:**
- Private implementation details
- Third-party library internals
- Trivial getters/setters
- Generated code

### Test Organization

Mirror source structure:
```
src/
  services/
    UserService.js
tests/
  services/
    UserService.test.js
```

---

## Documentation Standards

### README.md Requirements

Every project should have a comprehensive README with:

1. **Project Title and Description**
2. **Installation Instructions**
3. **Usage Examples**
4. **Configuration Options**
5. **Development Setup**
6. **Testing Instructions**
7. **Contributing Guidelines**
8. **License Information**

### Code Documentation

**Functions/Methods:**
```javascript
/**
 * Retrieves a user by their unique identifier.
 *
 * @param {string} userId - The unique user identifier
 * @param {Object} options - Optional parameters
 * @param {boolean} options.includeDeleted - Include soft-deleted users
 * @returns {Promise<User>} The user object
 * @throws {UserNotFoundError} When user doesn't exist
 *
 * @example
 * const user = await getUserById('123', { includeDeleted: false });
 */
async function getUserById(userId, options = {}) {
  // Implementation
}
```

### API Documentation

- Use OpenAPI/Swagger for REST APIs
- Use GraphQL schema for GraphQL APIs
- Document all endpoints, parameters, and responses
- Include example requests and responses

### Architecture Documentation

Create and maintain:
- **ARCHITECTURE.md**: High-level system design
- **ADRs (Architecture Decision Records)**: Major technical decisions
- **Diagrams**: System architecture, data flow, etc.

---

## AI Assistant Guidelines

### General Principles

When working as an AI assistant on this codebase:

1. **Understand Before Changing:**
   - Read relevant code before making modifications
   - Ask clarifying questions if requirements are unclear
   - Consider impact on existing functionality

2. **Follow Existing Patterns:**
   - Match the coding style of the file you're editing
   - Use established patterns and conventions
   - Don't introduce new patterns without discussion

3. **Be Thorough:**
   - Update tests when changing functionality
   - Update documentation when changing interfaces
   - Consider edge cases and error handling

4. **Communicate Clearly:**
   - Explain what changes you're making and why
   - Highlight any trade-offs or concerns
   - Provide context for decisions

### Task Approach

**For New Features:**
1. Understand requirements fully
2. Plan the implementation approach
3. Identify files that need changes
4. Implement with tests
5. Update documentation
6. Review for quality and consistency

**For Bug Fixes:**
1. Reproduce the bug if possible
2. Identify root cause
3. Fix with minimal changes
4. Add regression test
5. Verify fix doesn't break other functionality

**For Refactoring:**
1. Ensure tests exist and pass
2. Make incremental changes
3. Keep tests passing throughout
4. Verify behavior is unchanged
5. Update comments if needed

### Code Quality Checklist

Before committing, verify:

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] New code has appropriate tests
- [ ] No commented-out code
- [ ] No debug statements or console.logs
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling is appropriate
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered

### Security Considerations

Always check for:

1. **Input Validation:** Validate and sanitize all inputs
2. **SQL Injection:** Use parameterized queries
3. **XSS:** Escape output, use CSP headers
4. **Authentication:** Verify user permissions
5. **Secrets:** Never commit sensitive data
6. **Dependencies:** Keep dependencies updated
7. **OWASP Top 10:** Be aware of common vulnerabilities

### Performance Considerations

1. **Database Queries:**
   - Avoid N+1 queries
   - Use indexes appropriately
   - Paginate large result sets

2. **Algorithms:**
   - Consider time complexity (O(n), O(n²), etc.)
   - Use appropriate data structures
   - Cache expensive computations

3. **Resource Usage:**
   - Clean up resources (close files, connections)
   - Avoid memory leaks
   - Handle large files in streams

### Communication Style

**DO:**
- Be clear and concise
- Explain technical decisions
- Acknowledge uncertainty
- Suggest alternatives when appropriate
- Ask for clarification when needed

**DON'T:**
- Make assumptions about requirements
- Use overly complex solutions
- Ignore existing code patterns
- Skip error handling
- Leave incomplete work

### Working with Git

**Branch Management:**
- Work on feature branches, not main
- Keep branches focused and short-lived
- Rebase on latest develop before PR
- Delete branches after merge

**Commits:**
- Make atomic, logical commits
- Write clear commit messages
- Don't commit broken code
- Commit related changes together

**Pull Requests:**
- Provide clear PR description
- Reference related issues
- Include testing instructions
- Respond to review feedback

### Debugging Approach

When investigating issues:

1. **Gather Information:**
   - Error messages and stack traces
   - Reproduction steps
   - Environment details

2. **Isolate the Problem:**
   - Identify the failing component
   - Narrow down to specific function/line
   - Remove variables (binary search)

3. **Analyze:**
   - Check assumptions
   - Review recent changes
   - Consider edge cases

4. **Fix and Verify:**
   - Implement fix
   - Add test to prevent regression
   - Verify in multiple scenarios

### Collaboration

**When to Ask for Help:**
- Requirements are ambiguous
- Multiple approaches seem valid
- Change has broad impact
- Uncertainty about trade-offs
- Blocked by external dependency

**How to Ask:**
- Provide context and research done
- Explain what you've tried
- Present options with pros/cons
- Be specific about what you need

---

## Project-Specific Notes

### Current State

**Status:** New repository initialization
**Last Updated:** 2025-11-14

This repository is in its initial setup phase. As the project develops:

1. **Update Technology Stack:** Document languages, frameworks, and tools
2. **Define Architecture:** Create architecture documentation
3. **Establish Workflows:** Set up CI/CD pipelines
4. **Configure Tools:** Add linters, formatters, testing frameworks
5. **Add Templates:** Issue templates, PR templates
6. **Define Policies:** Code review process, merge policies

### Next Steps

Priority tasks for project setup:

1. [ ] Define project purpose and scope
2. [ ] Choose technology stack
3. [ ] Set up project structure
4. [ ] Configure development environment
5. [ ] Set up CI/CD pipeline
6. [ ] Create initial documentation
7. [ ] Define contribution guidelines
8. [ ] Set up issue tracking

### Maintenance

This document should be updated when:

- Project architecture changes
- New conventions are adopted
- Development workflow evolves
- New tools or frameworks are added
- Lessons learned from development

**Review Schedule:** Quarterly or after major changes

---

## Resources

### Documentation

- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Tools

- Version Control: Git
- Code Review: GitHub Pull Requests
- CI/CD: GitHub Actions (recommended)
- Documentation: Markdown

---

## Changelog

### 2025-11-14
- Initial creation of CLAUDE.md
- Established base conventions and guidelines
- Created project structure template

---

## Contact

For questions or clarifications about this document:
- Open an issue in the repository
- Contact the project maintainers

---

**Version:** 1.0.0
**Last Updated:** 2025-11-14
**Maintained By:** Project Team
