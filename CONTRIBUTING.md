# Contributing to VR Panorama Tour

Terima kasih atas minat Anda untuk berkontribusi pada proyek VR Panorama Tour! Dokumen ini akan membantu Anda memahami cara berkontribusi dengan efektif.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn
- Git

### Setup Development Environment
```bash
# Clone repository
git clone <repository-url>
cd mpnayx6b--run

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable components
│   ├── viewer/         # Viewer-specific components
│   ├── editor/         # Editor components (future)
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── store/              # State management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── data/               # Static data files
└── test/               # Test setup and utilities
```

## 🎯 Development Guidelines

### Code Style
- Gunakan TypeScript untuk semua file
- Ikuti ESLint dan Prettier rules
- Gunakan functional components dengan hooks
- Implementasikan proper error handling
- Tulis unit tests untuk semua components

### Component Structure
```typescript
import React from 'react';
import { ComponentProps } from './types';

interface Props {
  // Define props here
}

const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic here

  return (
    <div>
      {/* JSX here */}
    </div>
  );
};

export default ComponentName;
```

### State Management
- Gunakan Zustand untuk global state
- Gunakan React hooks untuk local state
- Implementasikan proper state updates
- Handle loading dan error states

### Testing
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🔧 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Implementasikan fitur
- Tulis tests
- Update documentation

### 3. Test Your Changes
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### 4. Build and Check
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### 5. Commit Changes
```bash
git add .
git commit -m "feat: add new feature

- Description of changes
- Breaking changes (if any)
- Closes #issue-number"
```

### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```

## 📝 Commit Message Convention

Gunakan conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tool changes

## 🧪 Testing Guidelines

### Unit Tests
- Test semua components
- Test utility functions
- Test custom hooks
- Maintain >80% coverage

### Integration Tests
- Test component interactions
- Test state management
- Test routing

### E2E Tests (Future)
- Test user workflows
- Test accessibility
- Test performance

## 🎨 UI/UX Guidelines

### Design System
- Gunakan Tailwind CSS classes
- Ikuti design tokens
- Maintain consistency
- Support dark mode (future)

### Accessibility
- Implementasikan ARIA labels
- Support keyboard navigation
- Test with screen readers
- Maintain WCAG compliance

### Responsive Design
- Mobile-first approach
- Test on multiple devices
- Optimize for performance

## 🔍 Code Review Process

### Before Submitting PR
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console errors
- [ ] Documentation updated
- [ ] Accessibility tested
- [ ] Performance checked

### Review Checklist
- [ ] Code quality
- [ ] Test coverage
- [ ] Performance impact
- [ ] Security considerations
- [ ] Accessibility compliance

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Docker
```bash
# Development
docker-compose --profile dev up

# Production
docker-compose --profile prod up
```

## 🐛 Bug Reports

### Template
```
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

**Additional Context**
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Template
```
**Feature Description**
Clear description of the feature

**Use Case**
Why this feature is needed

**Proposed Solution**
How to implement the feature

**Alternatives Considered**
Other approaches considered

**Additional Context**
Screenshots, mockups, etc.
```

## 📚 Documentation

### Code Documentation
- JSDoc untuk functions
- TypeScript interfaces
- README untuk complex components
- API documentation

### User Documentation
- User guides
- Feature documentation
- Troubleshooting guides

## 🤝 Community Guidelines

### Be Respectful
- Respect semua contributors
- Constructive feedback
- Inclusive language

### Communication
- Clear dan concise
- Professional tone
- Helpful responses

### Collaboration
- Share knowledge
- Help newcomers
- Mentor others

## 📞 Getting Help

### Resources
- [Project README](./README.md)
- [Issue Tracker](link-to-issues)
- [Discussions](link-to-discussions)

### Contact
- Create issue untuk questions
- Use discussions untuk ideas
- Join community chat

## 🎉 Recognition

### Contributors
- All contributors listed in README
- Special recognition untuk major contributions
- Thank you messages

### Guidelines
- Credit original authors
- Respect licenses
- Acknowledge inspiration

---

Terima kasih untuk berkontribusi pada VR Panorama Tour! 🎉
