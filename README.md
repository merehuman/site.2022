# jessa gillespie - mere human studio

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/merehuman/portfolio.git
cd portfolio
```

2. Install dependencies (optional, for development tools):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

This project has been reorganized for better maintainability and cleaner structure. All files are now properly organized into logical directories.

```
site.2022/
├── index.html              # Main entry point (landing page)
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── config.js          # Configuration settings
│   ├── utils.js           # Utility functions
│   ├── main.js            # Main JavaScript functionality
│   └── ascii-video-wrapper.js  # ASCII video handling
├── pages/                  # All HTML pages except index.html
│   ├── desktop.html       # Projects page
│   ├── info.html          # Information/about page
│   ├── storage.html       # Storage/resume page
│   ├── enter.html         # Entry page
│   ├── cv.html            # CV page
│   ├── invaders.html      # Space invaders project
│   ├── engine.html        # Game engine project
│   ├── 404.html           # Error page
│   ├── flowers.html       # Flowers project
│   ├── other.html         # Other project
│   ├── sdstudio.html      # SD Studio project
│   └── leaderlineTest.html # Leader line test
├── images/                 # Image assets
├── fonts/                  # Font files
├── leader-line-new-master/ # External library
├── anseki-leader-line-6c26a9d/ # External library
├── leader-line.min.js      # Minified leader line library
├── favicon.ico            # Site favicon
├── CNAME                  # Custom domain configuration
├── package.json           # Node.js dependencies
├── setup-dev.js           # Development setup script
├── cleanme.ps1            # Cleanup script
├── cleanme.bat            # Cleanup script wrapper
└── README.md              # Project documentation
```

### Navigation Structure

**Main Navigation (Consistent across all pages):**
- **Home**: `../index.html` (from pages) or `index.html` (from root)
- **Info**: `info.html` (relative to pages directory)
- **Resume**: External Google Docs link
- **Projects**: `desktop.html` (relative to pages directory)

### File Organization Benefits

**Before Reorganization:**
- All files mixed in root directory
- Inconsistent navigation paths
- Difficult to maintain and understand

**After Reorganization:**
- **Logical grouping**: HTML pages in `pages/`, CSS in `css/`, JS in `js/`
- **Consistent navigation**: All pages use relative paths correctly
- **Easy maintenance**: Clear structure makes updates straightforward
- **Clean root**: Only essential files in root directory

## Development

### Available Scripts

- `npm start` - Start a simple HTTP server
- `npm run dev` - Start live development server with auto-reload
- `npm run lint` - Check JavaScript code quality
- `npm run format` - Format code with Prettier
- `npm run validate` - Validate HTML files

### Maintenance Scripts

**Cleanup Script (`cleanme.ps1`):**
- Removes development artifacts (node_modules, IDE files, temp files)
- Cleans up before pushing to GitHub
- Usage: `.\cleanme.ps1 [-DryRun] [-Force] [-Help]`
- Also available as `cleanme.bat` for easy execution

**Examples:**
```bash
# See what would be cleaned (dry run)
.\cleanme.ps1 -DryRun

# Clean with confirmations
.\cleanme.ps1

# Clean without confirmations
.\cleanme.ps1 -Force
```

### Development Workflow

1. **Make changes** to HTML, CSS, or JS files
2. **Test locally** using the development server: `npm run dev`
3. **Run cleanup** before pushing: `.\cleanme.ps1 -DryRun`
4. **Commit changes** with descriptive messages
5. **Push to GitHub**

### Code Standards

This project follows modern web development standards:

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with custom properties and responsive design
- **ES6+**: Modern JavaScript with classes and modules
- **Performance**: Optimized loading and rendering
- **Accessibility**: WCAG 2.1 AA compliance

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Responsive Design

The website is fully responsive with breakpoints:
- **Desktop**: 1200px and above
- **Tablet**: 800px - 1199px
- **Mobile**: Below 800px

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences
- Focus management
- Semantic HTML structure

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and validation
5. Submit a pull request

## Contact

- **Website**: [merehuman.live](https://merehuman.live)
- **GitHub**: [@merehuman](https://github.com/merehuman)
- **Email**: [jessagillespie@gmail.com]

---