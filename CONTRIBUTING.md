# Contributing to @learningpad/api-client

Thank you for your interest in contributing to the LearningPad API Client! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/api-client.git
   cd api-client
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build the package:

   ```bash
   npm run build
   ```

5. Run tests:

   ```bash
   npm test
   ```

6. Run linting:
   ```bash
   npm run lint
   ```

## Development Workflow

### Making Changes

1. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bugfix-name
   ```

2. Make your changes following the coding standards below

3. Add tests for your changes

4. Run the test suite:

   ```bash
   npm test
   ```

5. Run linting and fix any issues:

   ```bash
   npm run lint
   npm run lint:fix
   ```

6. Build the package to ensure everything compiles:

   ```bash
   npm run build
   ```

7. Commit your changes with a descriptive message:

   ```bash
   git commit -m "feat: add new feature description"
   ```

8. Push your branch and create a pull request

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Write comprehensive tests for new functionality
- Update documentation for new features
- Use conventional commit messages

### Commit Message Format

We use conventional commits. Please format your commit messages as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(hooks): add useApiSubscription hook
fix(config): resolve token refresh issue
docs(readme): update installation instructions
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new functionality
- Aim for high test coverage (80%+)
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Test Structure

```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    // Setup
  });

  it("should do something specific", () => {
    // Test implementation
  });

  it("should handle error cases", () => {
    // Error test implementation
  });
});
```

## Documentation

### Updating Documentation

- Update README.md for new features
- Add JSDoc comments for new functions
- Update type definitions
- Add examples for new functionality

### Documentation Standards

- Use clear, concise language
- Provide code examples
- Include type information
- Explain use cases and benefits

## Pull Request Process

### Before Submitting

1. Ensure all tests pass
2. Run linting and fix issues
3. Build the package successfully
4. Update documentation if needed
5. Add changelog entry

### Pull Request Template

When creating a pull request, please include:

- Description of changes
- Related issues (if any)
- Testing instructions
- Screenshots (if applicable)
- Breaking changes (if any)

### Review Process

- All PRs require review from maintainers
- Address feedback promptly
- Keep PRs focused and atomic
- Update documentation as needed

## Release Process

### Version Bumping

We use semantic versioning (semver):

- `patch`: Bug fixes
- `minor`: New features (backward compatible)
- `major`: Breaking changes

### Release Steps

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the golden rule

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Inappropriate language or imagery

## Getting Help

### Questions and Support

- Open an issue for bug reports
- Use discussions for questions
- Join our community Slack
- Email: support@learningpad.com

### Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to @learningpad/api-client! 🚀
