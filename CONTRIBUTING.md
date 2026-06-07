# Contributing to KDM Care Hospital AI System

Thank you for your interest in contributing to this project! This document provides guidelines for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/MULTIMODEL-DISEASE-PREDICTION.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "Add: your feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python ml/train_tabular.py  # Train tabular models
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Code Style

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where appropriate
- Add docstrings to functions and classes
- Keep functions focused and small

### JavaScript/React (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Test both backend and frontend changes
- Test with different disease types

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure code is properly formatted
- Update documentation if needed

## Areas for Contribution

- **Model Improvements**: Better accuracy, new architectures
- **UI/UX Enhancements**: Better design, accessibility
- **New Features**: Additional disease predictions, analytics
- **Bug Fixes**: Report and fix bugs
- **Documentation**: Improve README, add tutorials
- **Testing**: Add more comprehensive tests

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the code
- Suggestions for improvements

## Medical Disclaimer

This is an educational project. Any contributions should maintain the disclaimer that this system is not intended for actual medical diagnosis and should not replace professional medical advice.

Thank you for contributing! 🎉
