// === THEME TOGGLING SECTION ===

document.addEventListener('DOMContentLoaded', function() {
    // Check if dark mode should be applied based on localStorage or user's system preference
    if (
        localStorage.getItem('color-theme') === 'dark' ||
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
        // Apply 'dark' class to the root HTML element
        document.documentElement.classList.add('dark');
    } else {
        // Remove 'dark' class if condition not met
        document.documentElement.classList.remove('dark');
    }

    // Get references to the theme toggle icons
    var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Show the correct icon based on theme
    if (
        localStorage.getItem('color-theme') === 'dark' ||
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
        // Show the light icon (moon), since we are in dark mode
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        // Show the dark icon (sun), since we are in light mode
        themeToggleDarkIcon.classList.remove('hidden');
    }

    // Theme toggle button logic
    var themeToggleBtn = document.getElementById('theme-toggle');

    themeToggleBtn.addEventListener('click', function () {
        // Swap icon visibility
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        // If a theme is already saved in localStorage
        if (localStorage.getItem('color-theme')) {
            // If the current theme is light, switch to dark
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                // If dark, switch to light
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        } else {
            // If no theme is saved, toggle based on current class
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    });
});


// === HAMBURGER MENU SECTION ===

document.addEventListener('DOMContentLoaded', function () {
    // Get all necessary elements
    const menuToggle = document.getElementById('menu-toggle');
    const slideMenu = document.getElementById('slide-menu');
    const overlay = document.getElementById('overlay');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    function toggleMenu() {
        // Check if menu is currently open (translated to 0)
        const isOpen = slideMenu.classList.contains('translate-x-0');

        if (isOpen) {
            // Close menu: slide out, hide overlay, switch icons
            slideMenu.classList.remove('translate-x-0');
            slideMenu.classList.add('translate-x-full');
            overlay.classList.add('hidden');
            hamburgerIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        } else {
            // Open menu: slide in, show overlay, switch icons
            slideMenu.classList.remove('translate-x-full');
            slideMenu.classList.add('translate-x-0');
            overlay.classList.remove('hidden');
            hamburgerIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
        }
    }

    // Clicking the hamburger icon or overlay toggles the menu
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Optional: Close the menu if a link inside it is clicked
    const menuItems = slideMenu.querySelectorAll('a');
    menuItems.forEach((item) => {
        item.addEventListener('click', toggleMenu);
    });
});


// === BOOK SEARCH + PAGINATION SECTION ===

// Cache DOM elements for searching, displaying results, pagination, and loader
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");
const loader = document.getElementById("loader");
const moreDetailDiv     = document.getElementById('moreDetailDiv');
const moreDetailClose   = document.getElementById('more-detail-close');

// Configuration for pagination and caching
const minLoaderTime = 1000;
let currentPage = 1;         // Start on page 1
let booksPerPage = 25;       // Number of books per page
let booksData = [];          // Will store fetched books
const searchCache = {};      // Simple in-memory cache
const authorCache = {};      // Cache for author info by authorKey
const workCache = {};        // Cache for work/book details by workKey

// Function to fetch books from OpenLibrary API based on search query
async function fetchBooks(query) {
  // If already fetched this query, reuse the cache
  if (searchCache[query]) {
    booksData = searchCache[query];
    currentPage = 1;
    displayBooks();
    displayPagination();
    return;
  }

  const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

  try {
    // Show loader and clear previous results
    loader.classList.remove("hidden");
    resultsContainer.innerHTML = "";

    const startTime = Date.now();

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorBody = await response.text();
      console.warn("⚠️ Server gaf fout-body:", errorBody);
      throw new Error(`Failed to fetch data (status ${response.status})`);
    }
    const data = await response.json();

    // Cache and display results
    searchCache[query] = data.docs;
    booksData = data.docs;
    currentPage = 1;

    // Ensure loader is visible at least minLoaderTime
    const elapsed = Date.now() - startTime;
    const remaining = minLoaderTime - elapsed;
    if (remaining > 0) {
      setTimeout(() => {
        loader.classList.add("hidden");
        displayBooks();
        displayPagination();
      }, remaining);
    } else {
      loader.classList.add("hidden");
      displayBooks();
      displayPagination();
    }
  } catch (error) {
    loader.classList.add("hidden");
    console.error("FetchBooks Error:", error);
    resultsContainer.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
  }
}

// Display details for a given author, hiding other views
async function showAuthorDetails(authorKey) {
  const moreDetailDiv = document.getElementById('moreDetailDiv');
  // Determine from which panel we are coming (before we hide 'moreDetailDiv')
  const fromMore = moreDetailDiv && !moreDetailDiv.classList.contains('hidden');
  // Then always hide the "more details" panel
  if (moreDetailDiv) moreDetailDiv.classList.add('hidden');

  const authorContainer = document.getElementById('authorContainer');
  try {
    // Fetch main author data
    const res = await fetch(`https://openlibrary.org/authors/${authorKey}.json`);
    if (!res.ok) throw new Error('Auteur niet gevonden');
    const data = await res.json();

    // Optionally fetch a few works by this author
    let worksHtml = '';
    try {
      const wres  = await fetch(`https://openlibrary.org/authors/${authorKey}/works.json?limit=6`);
      const wdata = await wres.json();
      if (wdata.entries) {
        worksHtml = `
          <h3 class="text-xl font-semibold mb-2 col-span-2">Works by this author</h3>
          <ul class="list-disc px-5">
        `;
        wdata.entries.slice(0,5).forEach(w => {
          worksHtml += `<li>${w.title}</li>`;
        });
        worksHtml += `</ul>`;
      }
    } catch(err) {
      console.warn('Kon werken niet laden', err);
    }

    // Build and inject HTML into the author container
    authorContainer.innerHTML = `
      <h2 class="text-2xl font-bold mb-4 col-span-2">${data.name}</h2>
      <div class="col-span-2">
        <p><strong>Born:</strong> ${data.birth_date || 'Unknown'}</p>
        <p><strong>Died:</strong> ${data.death_date || '—'}</p>
      </div>
      <p class="col-span-2"><strong>Biography:</strong> ${
        typeof data.bio === 'string' ? data.bio :
        data.bio?.value || 'No description.'
      }</p>
      ${worksHtml}
      <button
        id="author-back"
        class="mt-6 font-bold text-olive bg-beige px-4 py-2 rounded col-span-2 hover:bg-copper dark:bg-slate dark:text-beige cursor-pointer"
      >Back</button>
    `;

    // Show author view and hide other panels
    authorContainer.classList.remove('hidden');
    document.getElementById('book-detail').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('pagination').classList.add('hidden');

    // Handle clicking the Back button
    document.getElementById('author-back')
      .addEventListener('click', () => {
        authorContainer.classList.add('hidden');

        if (fromMore) {
          moreDetailDiv.classList.remove('hidden');
          moreDetailDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          document.getElementById('book-detail').classList.remove('hidden');
          document.getElementById('book-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

  } catch (err) {
    console.error('Fout bij laden auteur:', err);
    authorContainer.innerHTML = `<p class="text-red-600">Kon auteur niet laden.</p>`;
    authorContainer.classList.remove('hidden');
  }
}

// Render the list of books for the current page
function displayBooks() {
    resultsContainer.innerHTML = "";

    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksToShow = booksData.slice(start, end);

    if (booksToShow.length === 0) {
        resultsContainer.innerHTML = `<p class="text-olive dark:text-beige">No books found</p>`;
        return;
    }

    booksToShow.forEach((book) => {
        // Determine cover image URL or use placeholder
        const bookCover = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://placehold.co/1050x1600?text=No+Image+Available";

        const workKey = book.key;
        const bookTitle = book.title;
        const bookAuthor = book.author_name;

        // Create a clickable card element for each book
        const bookElement = document.createElement("div");
        bookElement.className = "m-2 hover:scale-110 cursor-pointer transition-transform duration-300 ease-in-out";
        bookElement.innerHTML = `
                    <img class="h-48 w-full lg:h-72 lg:w-60 object-cover rounded-lg border-2 border-olive dark:border-beige" src="${bookCover}" alt="Book Cover">
                    <h3 class="text-lg font-semibold text-olive dark:text-beige">${bookTitle}</h3>
                    <p class="text-sm text-olive dark:text-beige">${bookAuthor ? bookAuthor.join(", ") : "Unknown Author"}</p>
        `;

        // On click, fetch and display detailed info about this book
        bookElement.addEventListener("click", async () => {
            const detailDiv = document.getElementById("book-detail");
            const resultsContainer = document.getElementById("results");

            // Variables for readability
            const workKey = book.key; // e.g. "/works/OL12345W"
            const bookTitle = book.title;
            const bookAuthor = book.author_name;
            const bookKeyId = book.edition_key ? book.edition_key[0] : workKey.replace("/works/", "");
            const bookPublishYear = book.first_publish_year;
            const bookTotalEdition = book.edition_count;
            const bookCover = book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : "https://placehold.co/800x1400?text=No+Image+Available";

            // Fetch author image (with cache)
            let authorImageTag = '';
            let currentAuthorKey = null;
            if (book.author_key && book.author_key[0]) {
                const authorKey = book.author_key[0];
                currentAuthorKey = authorKey;

                if (authorCache[authorKey]) {
                    const authorData = authorCache[authorKey];
                    if (authorData.photos && authorData.photos.length > 0) {
                        const photoId = authorData.photos[0];
                        const photoUrl = `https://covers.openlibrary.org/a/id/${photoId}-M.jpg`;
                        authorImageTag = `<img src="${photoUrl}" alt="Author Image" class="w-32 h-32 object-cover mb-4 rounded-xl border-2 border-olive dark:border-beige">`;
                    }
                } else {
                    try {
                        const response = await fetch(`https://openlibrary.org/authors/${authorKey}.json`);
                        const authorData = await response.json();
                        authorCache[authorKey] = authorData;

                        if (authorData.photos && authorData.photos.length > 0) {
                            const photoId = authorData.photos[0];
                            const photoUrl = `https://covers.openlibrary.org/a/id/${photoId}-M.jpg`;
                            authorImageTag = `<img src="${photoUrl}" alt="Author Image" class="w-32 h-32 object-cover mb-4 rounded-xl border-2 border-olive dark:border-beige">`;
                        }
                    } catch (error) {
                        console.error("Failed to load author image", error);
                    }
                }
            }

            // Fetch book description and subjects (with cache)
            let bookDescription = '';
            let subjectsList = [];
            let isbn = '';
            if (workCache[workKey]) {
                const workData = workCache[workKey];
                if (workData.description) {
                    bookDescription = typeof workData.description === "string"
                        ? workData.description
                        : workData.description.value;
                } else {
                    bookDescription = "No description available.";
                }
                if (workData.subjects && workData.subjects.length > 0) {
                    subjectsList = workData.subjects.map(sub => sub.toLowerCase().replace(/\s+/g, '_'));
                }
            } else {
                try {
                    const workResponse = await fetch(`https://openlibrary.org${workKey}.json`);
                    const workData = await workResponse.json();
                    workCache[workKey] = workData;

                    if (workData.description) {
                        bookDescription = typeof workData.description === "string"
                            ? workData.description
                            : workData.description.value;
                    } else {
                        bookDescription = "No description available.";
                    }
                    if (workData.subjects && workData.subjects.length > 0) {
                        subjectsList = workData.subjects.map(sub => sub.toLowerCase().replace(/\s+/g, '_'));
                    }
                } catch (error) {
                    console.error("Failed to load book description or subjects", error);
                    bookDescription = "No description available.";
                }
            }

            // Fetch ISBN and additional details
            try {
                const editionResponse = await fetch(`https://openlibrary.org/works/${workKey.replace('/works/', '')}/editions.json`);
                const editionData = await editionResponse.json();
                if (editionData.entries && editionData.entries.length > 0) {
                    const firstEdition = editionData.entries[0];
                    isbn = firstEdition.isbn_13 || firstEdition.isbn_10 || 'Not available';
                }
            } catch (error) {
                console.error("Failed to load ISBN", error);
                isbn = 'Not available';
            }

            // 1) Fetching ratings
            let averageRating = "N/A";
            let ratingCount   = 0;
            try {
              const ratingsRes  = await fetch(`https://openlibrary.org${workKey}/ratings.json`);
              if (ratingsRes.ok) {
                const ratingsData = await ratingsRes.json();
                averageRating = ratingsData.summary.average.toFixed(1);   // bv. "4.3"
                ratingCount   = ratingsData.summary.count;               // bv. 1579
              }
            } catch (err) {
              console.warn("Kon rating niet laden:", err);
            }

            // Inject content into book-detail div
            detailDiv.innerHTML = `
                  <h2 class="text-2xl font-bold mb-4 col-span-2">${bookTitle}</h2>
                <div>
                    <img class="h-48 w-36 lg:h-60 lg:w-40 object-cover rounded-lg border-2 border-olive dark:border-beige" src="${bookCover}" alt="Book Cover">
                </div>
                <div>
                    <p class="text-left">
                        <strong>Author:</strong>
                        ${bookAuthor ? bookAuthor.map(author =>
                         `<span class="author-name text-copper hover:text-beige dark:text-copper dark:hover:text-slate cursor-pointer"
                            data-author-key="${currentAuthorKey}">
                            ${author}
                          </span>`
                       ).join(', ') : 'Unknown'}
                    </p>
                    <p><strong>Book Id:</strong> ${bookKeyId}</p>
                    <p><strong>ISBN:</strong> ${isbn}</p>
                    <p><strong>First Published:</strong> ${bookPublishYear || 'N/A'}</p>
                    <p><strong>Edition Count:</strong> ${bookTotalEdition}</p>
                    <p>
                        <strong>Genres:</strong>
                        ${subjectsList.length > 0 ?
                            subjectsList.slice(0, 2).map(subject =>
                                `<span class="text-beige dark:text-slate">
                                    ${subject.replace(/_/g, ' ')}
                                </span>`
                            ).join(', ') : 'No genres available'}
                    </p>
                    ${authorImageTag}
                </div>
                <div class="col-span-2">
                    <p><strong>Description:</strong> ${bookDescription}</p>
                </div>
                <div class="col-span-2">
                  <p class="mb-4 text-sm col-span-2">
                  <strong>Rating:</strong>
                  ${averageRating !== "N/A"
                    ? `${averageRating} ★ (${ratingCount} ratings)`
                    : "No ratings."}
                  </p>
                </div>
                <div id="related-books" class="col-span-2 mt-4"></div>
                <div id="author-books" class="col-span-2 mt-4"></div>
                <button class="col-span-2 mt-4 font-bold cursor-pointer text-olive bg-beige px-4 py-2 rounded hover:bg-copper dark:bg-slate dark:text-beige"
                    onclick="
                        document.getElementById('book-detail').classList.add('hidden');
                        document.getElementById('results').classList.remove('hidden');
                        document.getElementById('pagination').classList.remove('hidden');
                    ">
                    Close
                </button>
            `;

            const authorNameElems = detailDiv.querySelectorAll('.author-name');
            authorNameElems.forEach(elem =>
                elem.addEventListener('click', () => {
                    const key = elem.dataset.authorKey;
                    showAuthorDetails(key);
                })
            );

            detailDiv.classList.remove("hidden");
            resultsContainer.classList.add("hidden");
            document.getElementById('pagination').classList.add('hidden');
            detailDiv.scrollIntoView({ behavior: 'smooth' });

// Fetch and display related books based on the first subject
if (subjectsList.length > 0) {
    const subjectSlug = subjectsList[0];
    const relatedContainer = document.getElementById('related-books');
    fetch(`https://openlibrary.org/subjects/${subjectSlug}.json`)
        .then(res => res.json())
        .then(data => {
            const relatedWorks = data.works.filter(w => w.key !== workKey).slice(0, 5);
            if (relatedWorks.length > 0) {
                let html = '<h3 class="text-xl font-semibold mb-2">Related Books</h3><div class="grid grid-cols-5 gap-4">';
                relatedWorks.forEach(w => {
                    const coverUrl = w.cover_id ? `https://covers.openlibrary.org/b/id/${w.cover_id}-M.jpg` : 'https://placehold.co/105x150?text=No+Image';
                    html += `
                        <div class="related-book text-center cursor-pointer hover:scale-110 transition-transform duration-300"
                            data-book-key="${w.key}"
                            onclick="showMoreDetail('${w.key}')">
                            <img class="h-32 w-auto mx-auto object-cover mb-1" src="${coverUrl}" alt="${w.title}">
                            <p class="text-sm text-beige dark:text-slate">${w.title}</p>
                        </div>`;
                });
                html += '</div>';
                relatedContainer.innerHTML = html;
            } else {
                relatedContainer.innerHTML = '<p class="text-sm">No related books found.</p>';
            }
        })
        .catch(err => {
            console.error('Error fetching related books', err);
            relatedContainer.innerHTML = '<p class="text-sm text-red-600">Error loading related books.</p>';
        });
}

// Fetch and display other books by the same author
if (currentAuthorKey) {
    const authorContainer = document.getElementById('author-books');
    fetch(`https://openlibrary.org/authors/${currentAuthorKey}/works.json?limit=6`)
        .then(res => res.json())
        .then(data => {
            const authorWorks = data.entries.filter(w => w.key.replace('/works/', '') !== bookKeyId).slice(0, 5);
            if (authorWorks.length > 0) {
                let html = '<h3 class="text-xl font-semibold mb-2">Other Books by Author</h3><div class="grid grid-cols-5 gap-4">';
                authorWorks.forEach(w => {
                    let coverId = w.cover_id || (w.covers && w.covers.length > 0 ? w.covers[0] : null);
                    const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://placehold.co/105x150?text=No+Image';
                    html += `
                        <div class="author-book text-center cursor-pointer hover:scale-110 transition-transform duration-300"
                            data-book-key="${w.key}"
                            onclick="showMoreDetail('${w.key}')">
                            <img class="h-32 w-auto mx-auto object-cover mb-1" src="${coverUrl}" alt="${w.title}">
                            <p class="text-sm text-beige dark:text-slate">${w.title}</p>
                        </div>`;
                });
                html += '</div>';
                authorContainer.innerHTML = html;
            } else {
                authorContainer.innerHTML = '<p class="text-sm">No other books found from this author.</p>';
            }
        })
        .catch(err => {
            console.error('Error fetching author books', err);
            authorContainer.innerHTML = '<p class="text-sm text-red-600">Error loading author books.</p>';
        });
}
        });

        resultsContainer.appendChild(bookElement);
    });
}

// Build and display pagination controls (Previous, page numbers, Next)
function displayPagination() {
    const totalPages = Math.ceil(booksData.length / booksPerPage);
    paginationContainer.innerHTML = "";

    // Previous button
    const previousButton = document.createElement("button");
    previousButton.textContent = "Previous";
    previousButton.disabled = currentPage === 1;
    previousButton.classList.add("px-4", "py-2", "mx-1", "bg-olive", "text-beige", "rounded", "hover:bg-copper", "disabled:bg-gray-300", "disabled:text-gray-500", "dark:bg-beige", "dark:text-slate");
    previousButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayBooks();
            displayPagination();
        }
    });
    paginationContainer.appendChild(previousButton);

    // Numbered page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;

        if (i === currentPage) {
            pageButton.classList.add("px-4", "py-2", "mx-1", "bg-beige", "text-olive", "font-bold", "border-2", "border-olive", "rounded", "dark:bg-slate", "dark:text-beige", "dark:border-beige");
        } else {
            pageButton.classList.add("px-4", "py-2", "mx-1", "bg-olive", "text-beige", "rounded", "hover:bg-copper", "hover:text-beige", "dark:bg-beige", "dark:text-slate");
        }

        pageButton.disabled = i === currentPage;
        pageButton.addEventListener("click", () => {
            currentPage = i;
            displayBooks();
            displayPagination();
        });
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.classList.add("px-4", "py-2", "mx-1", "bg-olive", "text-beige", "rounded", "hover:bg-copper", "disabled:bg-gray-300", "disabled:text-gray-500", "dark:bg-beige", "dark:text-slate");
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayBooks();
            displayPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}


// === EVENT LISTENERS FOR SEARCH ===
// Clicking the search button does:
// - Hide any open detail views
// - Reset author view
// - Validate input and launch fetchBooks()
if (searchButton) {
  searchButton.addEventListener("click", () => {
    if (moreDetailDiv) moreDetailDiv.classList.add('hidden');

    const authorContainer = document.getElementById('authorContainer');
    if (authorContainer) {
      authorContainer.classList.add('hidden');
      authorContainer.innerHTML = '';
    }

    const detailDiv = document.getElementById('book-detail');
    if (detailDiv) detailDiv.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.remove('hidden');
    if (paginationContainer) paginationContainer.classList.remove('hidden');

    const query = searchInput.value.trim();
    if (!query) {
      resultsContainer.innerHTML = `<p class="text-olive dark:text-beige">Please enter a search term.</p>`;
      return;
    }
    fetchBooks(query);
  });
}

// Pressing Enter in the search field triggers the same action
if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // verberg moreDetailDiv
      if (moreDetailDiv) moreDetailDiv.classList.add('hidden');

      // **Nieuw**: verberg auteur-view
      const authorContainer = document.getElementById('authorContainer');
      if (authorContainer) {
        authorContainer.classList.add('hidden');
        authorContainer.innerHTML = '';
      }

      searchButton.click();
    }
  });
}

// On page load of library.html, check URL for an initial 'query' parameter
document.addEventListener("DOMContentLoaded", () => {
  function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }

  const initialQuery = getQueryParam("query");
  if (initialQuery) {
    searchInput.value = initialQuery;
    fetchBooks(initialQuery);
  }
});

// Initialize EmailJS with your user ID
emailjs.init('iGiQMVl_DyJE3t5Ay');

// EmailJS form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form elements
            const submitBtn = document.getElementById('submit-btn');
            const btnText = document.getElementById('btn-text');
            const btnLoading = document.getElementById('btn-loading');
            const successMessage = document.getElementById('success-message');
            const errorMessage = document.getElementById('error-message');
            const formMessage = document.getElementById('form-message');
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            
            // Hide previous messages
            successMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            formMessage.classList.add('hidden');
            
            // Get form data - matching your EmailJS template variables
            const formData = {
                from_name: document.getElementById('fname').value + ' ' + document.getElementById('lname').value,
                from_email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            // Send customer message to you
            emailjs.send('service_76yr6tg', 'template_6i93xkb', formData)
                .then(function(response) {
                    console.log('Customer message sent successfully!', response.status, response.text);
                    
                    // Send confirmation email to customer
                    return emailjs.send('service_76yr6tg', 'template_re8zqp7', formData);
                })
                .then(function(response) {
                    console.log('Confirmation email sent successfully!', response.status, response.text);
                    
                    // Show success message
                    formMessage.classList.remove('hidden');
                    successMessage.classList.remove('hidden');
                    
                    // Reset form
                    contactForm.reset();
                })
                .catch(function(error) {
                    console.error('EmailJS error:', error);
                    
                    // Show error message
                    formMessage.classList.remove('hidden');
                    errorMessage.classList.remove('hidden');
                })
                .finally(function() {
                    // Reset button state
                    submitBtn.disabled = false;
                    btnText.classList.remove('hidden');
                    btnLoading.classList.add('hidden');
                });
        });
    }
});

// === UPDATE LISTENERS FOR RELATED & AUTHOR BOOKS ===

document.addEventListener('click', function(event) {
  // Delegate clicks on dynamically generated related-book and author-book elements
  const el = event.target.closest('.related-book, .author-book');
  if (!el) return;
  const key = el.dataset.bookKey;
  showMoreDetail(key);
});

// Interaction after clicking Author/Genre books
async function showMoreDetail(workKey) {
  // 1) Fetch work, editions and author data
  const [workRes, editionsRes] = await Promise.all([
    fetch(`https://openlibrary.org${workKey}.json`),
    fetch(`https://openlibrary.org/works/${workKey.replace('/works/', '')}/editions.json`)
  ]);
  const workData    = await workRes.json();
  const editionData = await editionsRes.json();
  const firstEd     = editionData.entries?.[0] || {};
  const bookKeyId   = workKey.replace('/works/', '');

  // Prepare subjects
  const subjectsList = Array.isArray(workData.subjects)
    ? workData.subjects.map(sub => sub.toLowerCase().replace(/\s+/g, '_'))
    : [];

  // 2) Gather author names and keys
  let authorInfos = [];
  if (Array.isArray(workData.authors)) {
    authorInfos = await Promise.all(
      workData.authors.map(async a => {
        const key = a.author.key.replace('/authors/', '');
        const json = await fetch(`https://openlibrary.org/authors/${key}.json`).then(r => r.json());
        return { name: json.name, key };
      })
    );
  }

  // Compute publish year
  const publishYear =
    firstEd.publish_year?.[0] ||
    workData.first_publish_year ||
    (Array.isArray(firstEd.publish_date) ? firstEd.publish_date[0] : firstEd.publish_date) ||
    'N/A';

  // Build book object
  const book = {
    title: workData.title,
    cover: workData.covers
      ? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`
      : null,
    isbn: firstEd.isbn_13?.[0] || firstEd.isbn_10?.[0] || 'N/A',
    year: publishYear,
    desc: typeof workData.description === 'string'
      ? workData.description
      : workData.description?.value || 'No description.',
    authors: authorInfos
  };

  // 1) Fetching ratings
let averageRating = "N/A";
let ratingCount   = 0;

try {
  const ratingsRes = await fetch(`https://openlibrary.org${workKey}/ratings.json`);
  if (ratingsRes.ok) {
    const ratingsData = await ratingsRes.json();
    const avg = ratingsData.summary?.average;
    const cnt = ratingsData.summary?.count;

    // Check of er écht een gemiddelde is
    if (typeof avg === "number") {
      averageRating = avg.toFixed(1); // bv. "4.3"
      ratingCount   = cnt;            // bv. 1579
    }
  } else {
    console.warn("Ratings endpoint gaf status", ratingsRes.status);
  }
} catch (err) {
  console.warn("Kon rating niet laden:", err);
}


  // 3) Render HTML into moreDetailDiv
  moreDetailDiv.innerHTML = `
    <h2 class="text-2xl font-bold mb-4 col-span-2">${book.title}</h2>
    <div>
      <img
        class="h-48 w-36 lg:h-60 lg:w-40 object-cover rounded-lg border-2 border-olive dark:border-beige"
        src="${book.cover}"
        alt="Book Cover"
      >
    </div>
    <div>
      <p class="text-left">
        <strong>Author:</strong>
        ${
          book.authors.length > 0
            ? book.authors.map(author =>
                `<span
                   class="author-name text-copper hover:text-beige dark:text-copper dark:hover:text-slate cursor-pointer"
                   data-author-key="${author.key}"
                 >${author.name}</span>`
              ).join(', ')
            : 'Unknown'
        }
      </p>
      <p><strong>Book Id:</strong> ${bookKeyId}</p>
      <p><strong>ISBN:</strong> ${book.isbn}</p>
      <p><strong>First Published:</strong> ${book.year}</p>
      <p>
        <strong>Genres:</strong>
        ${
          subjectsList.length > 0
            ? subjectsList.slice(0, 2).map(subject =>
                `<span class="text-beige dark:text-slate">${subject.replace(/_/g, ' ')}</span>`
              ).join(', ')
            : 'No genres available'
        }
      </p>
    </div>
    <div class="col-span-2">
      <p><strong>Description:</strong> ${book.desc}</p>
    </div>
    <div class="col-span-2">
      <p class="mb-4 text-sm col-span-2">
      <strong>Rating:</strong>
      ${averageRating !== "N/A"
        ? `${averageRating} ★ (${ratingCount} ratings)`
        : "No ratings"}
      </p>
    </div>
    <button
      id="more-detail-back"
      class="col-span-2 mt-4 font-bold cursor-pointer text-olive bg-beige px-4 py-2 rounded hover:bg-copper dark:bg-slate dark:text-beige"
    >Back</button>
  `;

  // 4) Attach click listeners to author spans
  moreDetailDiv.querySelectorAll('.author-name').forEach(elem =>
    elem.addEventListener('click', () => showAuthorDetails(elem.dataset.authorKey))
  );

  // 5) Show/hide sections and scroll into view
  document.getElementById('results').classList.add('hidden');
  document.getElementById('pagination').classList.add('hidden');
  document.getElementById('book-detail').classList.add('hidden');
  moreDetailDiv.classList.remove('hidden');
  // Zorg dat het paneel bovenin de viewport verschijnt
  moreDetailDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 6) Back button handler
  document.getElementById('more-detail-back').addEventListener('click', () => {
    moreDetailDiv.classList.add('hidden');
    document.getElementById('book-detail').classList.remove('hidden');
    // Scroll terug naar boven als gewenst
    document.getElementById('book-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Handler to close the More Details pane
moreDetailClose.addEventListener('click', () => {
  moreDetailDiv.classList.add('hidden');
  document.getElementById('book-detail').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');
  document.getElementById('pagination').classList.add('hidden');
});