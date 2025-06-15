# <div align="center">
  <img src="img/Liber_Library_Logo_Dark.png" alt="LiberLibrary Logo Dark" width="200"/>
</div>

- This GitHub repository is public
- A modern, responsive web application for exploring and discovering books from the Open Library database. LiberLibrary provides an intuitive interface for searching books, viewing author details, and managing your reading journey.

## 🌟 Features
 
### Core Functionalities
- **Advanced Book Search**: Search through millions of books by title, author, or keywords
- **Detailed Book Information**: View comprehensive book details including:
  - Cover images
  - Author information
  - Publication details
  - Description
  - Available editions
- **Author Profiles**: Explore author biographies and their works
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Pagination**: Efficient browsing with paginated results
- **Caching System**: Optimized performance with intelligent caching of search results and author data
 
### Theme Support
- **Light/Dark Mode**: Seamless switching between light and dark themes
- **System Preference Detection**: Automatically matches your system's theme preference
- **Persistent Theme Selection**: Remembers your theme preference across sessions
- **Custom Color Scheme**: Carefully designed color palette for optimal reading experience
 
## 🛠️ Technical Specifications
 
### Frontend Technologies
- **HTML5**: Semantic markup for better accessibility
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **JavaScript**: Vanilla JS for dynamic functionality
- **Open Library API**: Integration with Open Library's extensive book database
 
### Performance Optimizations
- Client-side caching for search results
- Author information caching
- Work details caching
- Minimum loader time for smooth user experience
- Efficient DOM manipulation
- Responsive image loading
 
### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
 
## 🚀 Getting Started
 
### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
 
### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/liberlibrary.git
   ```
 
2. Install dependencies:
   ```bash
   npm install
   ```
 
3. Install Tailwind CSS:
   ```bash
   npm install tailwindcss @tailwindcss/cli
   ```
 
4. Start the development server:
   ```bash
   npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
   ```
 
5. Open `index.html` in your browser
 
## 📱 Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Optimized search interface for all screen sizes
- Flexible grid layouts
- Touch-friendly interactions
 
## 🎨 Theme Customization
The application uses a custom color scheme with the following main colors:
- Light Theme:
  - Background: Beige
  - Text: Slate
  - Accent: Olive
  - Hover: Copper
- Dark Theme:
  - Background: Slate
  - Text: Beige
  - Accent: Beige
  - Hover: Copper
 
## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
 
## 📄 License
- This project is licensed under the MIT License - see the LICENSE file for details.
- For any inquiries, please contact info@liberlibrary.com
 
## 🙏 Acknowledgments
- Open Library for providing the book database API
- Tailwind CSS for the styling framework
