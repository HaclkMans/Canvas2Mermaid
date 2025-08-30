# Contributing to Canvas2Mermaid

Thank you for your interest in contributing to Canvas2Mermaid! We welcome all forms of contributions.

## Development Setup

1. Fork and clone the repository
   ```bash
   git clone https://github.com/your-username/Canvas2Mermaid.git
   cd Canvas2Mermaid
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Development mode
   ```bash
   npm run dev     # Watch mode for development
   ```

## Project Structure

```
src/
├── domain/           # Domain models and business logic
│   ├── entities/     # Canvas, Mermaid entities
│   ├── repositories/ # Repository interfaces
│   └── usecases/     # Use case implementations
├── infrastructure/   # Infrastructure implementations
│   └── repositories/ # Repository implementations
├── presentation/     # UI and commands
│   ├── commands/     # Command implementations
│   └── ui/          # Configuration UI
└── shared/          # Shared utilities and constants
    ├── constants/    # Constant definitions
    └── utils/       # Utility functions
```

## Code Standards

1. **TypeScript Guidelines**
   - Use strict mode (`strict: true`)
   - All files must use `.ts` extension
   - Follow existing code style
   - Use dependency injection pattern
   - Avoid using global app instance

2. **Naming Conventions**
   - Classes: PascalCase (e.g., `CanvasEntity`)
   - Interfaces: I prefix (e.g., `ICanvasRepository`)
   - Methods and variables: camelCase
   - Constants: UPPER_CASE

3. **Documentation**
   - Use JSDoc format
   - Document all public methods
   - Add explanations for complex logic
   - Keep comments focused and relevant

4. **Best Practices**
   - Avoid unnecessary console logging
   - Use dependency injection
   - Keep functions small and focused
   - Write testable code
   - Handle errors gracefully

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat`: New features
  ```bash
  git commit -m "feat: add support for nested groups"
  ```
- `fix`: Bug fixes
  ```bash
  git commit -m "fix: resolve large canvas conversion timeout"
  ```
- `docs`: Documentation updates
  ```bash
  git commit -m "docs: update installation instructions"
  ```
- `refactor`: Code refactoring
  ```bash
  git commit -m "refactor: improve canvas parsing logic"
  ```

## Testing Checklist

1. **Canvas Conversion**
   - Empty canvas files
   - Canvas with multiple nodes
   - Canvas with nested groups
   - Canvas with various link types
   - Large canvas files (performance)

2. **Feature Testing**
   - Command palette functionality
   - Clipboard integration
   - Configuration options
   - Error handling and recovery

## Pull Request Process

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Development and Testing
   - Ensure code builds successfully
   - Test all affected functionality
   - Update relevant documentation
   - Follow code standards

3. Submit PR
   - Provide clear description
   - List key changes
   - Include test results
   - Add screenshots if applicable

## Questions and Support

For any questions or issues:
- Open an issue
- Discuss in pull requests
- Contact via email

Thank you for contributing!