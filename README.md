# ASL Book

An intelligent textbook for teaching American Sign Language (ASL) to students in grades 4-8.

[![MkDocs](https://img.shields.io/badge/docs-mkdocs-blue)](https://www.mkdocs.org/)
[![Material Theme](https://img.shields.io/badge/theme-material-lightblue)](https://squidfunk.github.io/mkdocs-material/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📖 About

This project is an interactive, web-based textbook designed for a 6-week introductory ASL elective course. The curriculum emphasizes visual learning, movement, and creative expression, making it particularly suitable for students with dyslexia, ADHD, and related learning differences.

**Live Site:** [https://Olufsonc-hub.github.io/asl-book/](https://Olufsonc-hub.github.io/asl-book/)

## ✨ Features

- **Accessible Design**: Built with inclusion in mind for diverse learners
- **Structured Curriculum**: Based on Bloom's 2005 Taxonomy learning objectives
- **Interactive Content**: Games, activities, and visual learning approaches
- **Responsive Layout**: Material for MkDocs theme ensures mobile-friendly access
- **Easy Navigation**: Clear course structure with searchable content

## 🚀 Getting Started

### Prerequisites

- Python 3.12 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Olufsonc-hub/asl-book.git
   cd asl-book
   ```

2. Install dependencies:
   ```bash
   pip install mkdocs mkdocs-material
   ```

### Local Development

Serve the site locally with live reload:
```bash
mkdocs serve
```

The site will be available at `http://127.0.0.1:8000`

### Building

Build the static site:
```bash
mkdocs build
```

The built site will be in the `./site` directory.

### Deployment

Deploy to GitHub Pages:
```bash
mkdocs gh-deploy
```

## 📚 Course Content

The curriculum covers:

- **Week 1**: ASL alphabet and fingerspelling fundamentals
- **Week 2**: Emotions and feelings vocabulary
- **Week 3**: Family and people signs
- **Week 4**: Food and favorites
- **Week 5**: Animals and nature
- **Week 6**: Expressive storytelling and performance

See the [Course Description](docs/course-description.md) for complete learning objectives and activities.

## 🗂️ Project Structure

```
asl-book/
├── docs/                    # Markdown content files
│   ├── index.md            # Homepage
│   ├── about.md            # About page
│   └── course-description.md  # Full course details
├── site/                   # Generated static site (git-ignored)
├── mkdocs.yml             # MkDocs configuration
└── README.md              # This file
```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Content Guidelines

When adding content:
- Maintain accessibility-first approach
- Use clear, age-appropriate language (grades 4-8)
- Include visual elements where possible
- Follow the educational structure based on Bloom's Taxonomy
- Ensure content supports diverse learning styles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Curtis Olufson**

- GitHub: [@Olufsonc-hub](https://github.com/Olufsonc-hub)

## 🙏 Acknowledgments

- Material for MkDocs theme
- The Deaf community and ASL educators
- Students and educators who inspire accessible learning

## 📧 Support

For questions or support, please [open an issue](https://github.com/Olufsonc-hub/asl-book/issues) on GitHub.

---

Built with [MkDocs](https://www.mkdocs.org/) and [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
