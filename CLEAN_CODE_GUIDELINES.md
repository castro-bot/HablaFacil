# Clean Code Guidelines

## Overview

This document serves as a comprehensive guide for writing clean, maintainable, and extensible code. It outlines principles and practices that ensure code quality, reusability, and long-term maintainability. When writing or reviewing code, follow these guidelines to create software that is easy to understand, modify, and extend. This file is used by LLMs to understand and enforce coding standards throughout the codebase.

---

## Core Principles

### 1. DRY (Don't Repeat Yourself)

**Principle**: Every piece of knowledge should have a single, unambiguous representation within a system.

**Practices**:

- Extract repeated logic into reusable functions, classes, or modules
- Use constants for repeated values
- Create shared utilities for common operations
- Avoid copy-pasting code blocks
- When you find yourself writing similar code more than twice, refactor it

---

### 2. Code Reusability

**Principle**: Write code that can be used in multiple contexts without modification or with minimal adaptation.

**Practices**:

- Create generic, parameterized functions instead of specific ones
- Use composition over inheritance where appropriate
- Design functions to be pure (no side effects) when possible
- Create utility libraries for common operations
- Use dependency injection to make components reusable
- Design APIs that are flexible and configurable

---

### 3. Abstract Functions and Abstractions

**Principle**: Create abstractions that hide implementation details and provide clear, simple interfaces.

**Practices**:

- Use interfaces and abstract classes to define contracts
- Create abstraction layers between different concerns
- Hide complex implementation behind simple function signatures
- Use dependency inversion - depend on abstractions, not concretions
- Create factory functions/classes for object creation
- Use strategy pattern for interchangeable algorithms

---

### 4. Extensibility

**Principle**: Design code that can be easily extended with new features without modifying existing code.

**Practices**:

- Follow the Open/Closed Principle: open for extension, closed for modification
- Use plugin architectures and hooks for extensibility
- Design with future requirements in mind (but don't over-engineer)
- Use configuration over hardcoding
- Create extension points through interfaces and callbacks
- Use composition and dependency injection
- Design APIs that can accommodate new parameters/options

---

### 5. Avoid Magic Numbers and Strings

**Principle**: Use named constants instead of hardcoded values to improve readability and maintainability.

**Practices**:

- Extract all magic numbers into named constants
- Use enums for related constants
- Create configuration objects for settings
- Use constants for API endpoints, timeouts, limits, etc.
- Document why specific values are used

---

## Additional Best Practices

- **Single Responsibility Principle**: Each function, class, or module should have one reason to change
- **Meaningful Names**: Use descriptive names that reveal intent
- **Small Functions**: Functions should do one thing and do it well
- **Error Handling**: Handle errors explicitly with meaningful messages
- **Type Safety**: Use TypeScript types/interfaces effectively, avoid `any`
- **Testing Considerations**: Write testable code with dependency injection
- **Code Organization**: Group related functionality, follow consistent structure

---

## Code Review Checklist

- [ ] No code duplication (DRY principle)
- [ ] Meaningful variable and function names
- [ ] No magic numbers or strings
- [ ] Functions are small and focused
- [ ] Proper error handling
- [ ] Type safety maintained
- [ ] Code is testable
- [ ] Proper abstraction levels
- [ ] Extensibility considered
- [ ] Single responsibility principle followed
