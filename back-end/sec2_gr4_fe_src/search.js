// ===== SEARCH FUNCTIONALITY =====
// This script handles search on both header (all pages) and search page

(function() {
  const isSearchPage = window.location.pathname.includes('search.html');

  if (isSearchPage) {
    // ===== SEARCH PAGE SCRIPT =====
    initSearchPage();
  } else {
    // ===== HEADER SEARCH SCRIPT (for all other pages) =====
    initHeaderSearch();
  }

  // ----- HEADER SEARCH (redirect to search page) -----
  function initHeaderSearch() {
    const searchInput = document.querySelector('.searchbar__input');
    const searchButton = document.querySelector('.searchbar .btn--ghost');
    const searchSelect = document.querySelector('.searchbar select');

    // Handle search button click
    if (searchButton) {
      searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
      });
    }

    // Handle Enter key in search input
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performSearch();
        }
      });
    }

    // Perform search and redirect to search.html
    function performSearch() {
      const query = searchInput ? searchInput.value.trim() : '';
      const filter = searchSelect ? searchSelect.value : 'All';

      // Build URL parameters
      const params = new URLSearchParams();
      
      if (query) {
        params.append('q', query);
      }
      
      if (filter && filter !== 'All') {
        params.append('filter', filter);
      }

      // Redirect to search page
      window.location.href = `search.html?${params.toString()}`;
    }
  }

  // ----- SEARCH PAGE SCRIPT (fetch and display results) -----
  function initSearchPage() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    function init() {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const initialQuery = urlParams.get('q') || '';
      const initialFilter = urlParams.get('filter') || 'All';

      // Get search elements - using the MAIN search box, not header
      const searchInput = document.getElementById('q');
      const filters = document.querySelectorAll('.filters .filter select');
      const categorySelect = filters[0];
      const statusSelect = filters[1];
      const ratingSelect = filters[2];
      const sortSelect = filters[3];
      const resultsContainer = document.querySelector('.results');

      // Debug: check if elements are found
      console.log('Search elements:', {
        searchInput: !!searchInput,
        categorySelect: !!categorySelect,
        statusSelect: !!statusSelect,
        ratingSelect: !!ratingSelect,
        sortSelect: !!sortSelect,
        resultsContainer: !!resultsContainer
      });

      if (!searchInput || !resultsContainer) {
        console.error('Search page elements not found');
        return;
      }

      // Set initial values from URL
      searchInput.value = initialQuery;
      if (categorySelect && initialFilter !== 'All') {
        categorySelect.value = initialFilter;
      }

      // Clear URL parameters after reading them (so refresh shows clean URL)
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Fetch and display results
      async function fetchSearchResults() {
        const query = searchInput.value.trim();
        const category = categorySelect ? categorySelect.value : 'All';
        const status = statusSelect ? statusSelect.value : 'All';
        const rating = ratingSelect ? ratingSelect.value : 'All';
        const sort = sortSelect ? sortSelect.value : 'Latest update';

        console.log('Fetching with params:', { query, category, status, rating, sort });

        // Build API params
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('limit', 20);
        
        if (query) {
          params.append('search', query);
        }
        
        if (category !== 'All') {
          params.append('type', category.toLowerCase());
        }

        if (status !== 'All') {
          params.append('status', status);
        }

        if (rating !== 'All') {
          params.append('rating', rating);
        }

        if (sort) {
          params.append('sort', sort);
        }

        try {
          resultsContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading...</p>';

          console.log('API URL:', `/api/book-list?${params.toString()}`);

          const res = await fetch(`/api/book-list?${params.toString()}`);
          const result = await res.json();

          console.log('API Response:', result);

          if (!res.ok || !result.success) {
            resultsContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">Failed to load results</p>';
            console.error('API Error:', result);
            return;
          }

          displayResults(result.data);
        } catch (err) {
          console.error('Search error:', err);
          resultsContainer.innerHTML = `<p style="text-align:center; padding: 2rem;">Error: ${err.message}</p>`;
        }
      }

      // Display search results
      function displayResults(books) {
        console.log('Displaying books:', books.length);

        if (books.length === 0) {
          resultsContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">No results found. Try a different search!</p>';
          return;
        }

        resultsContainer.innerHTML = books.map(book => `
          <article class="result">
            <a class="cover block" href="detail.html?id=${book.Book_id}">
              <div class="thumb" style="${book.CoverUrl ? `background-image: url('${book.CoverUrl}'); background-size: cover; background-position: center;` : ''}">
                ${book.CoverUrl ? '' : 'COVER'}
              </div>
            </a>
            <div class="result-body">
              <h2 class="result-title">
                <a href="detail.html?id=${book.Book_id}">${book.Title}</a>
              </h2>
              <p class="result-meta">${book.Author_Name || 'Unknown'} · ${book.Genre || 'N/A'} · ${book.Status_B || 'N/A'}</p>
              <p class="result-desc">${book.Synopsis || 'No description available.'}</p>
              <div class="result-stats">
                <span class="chip">${book.Type || 'N/A'}</span>
                <span class="chip">${book.Rating || 'N/A'}</span>
                ${book.Release_year ? `<span class="chip">${book.Release_year}</span>` : ''}
              </div>
              <div class="result-tags">
                ${book.Read_platform ? `<a class="tag" href="#">${book.Read_platform}</a>` : ''}
              </div>
            </div>
          </article>
        `).join('');
      }

      // Handle search input changes (debounced)
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(fetchSearchResults, 500);
      });

      // Handle filter changes
      [categorySelect, statusSelect, ratingSelect, sortSelect].forEach(select => {
        if (select) {
          select.addEventListener('change', () => {
            console.log('Filter changed');
            fetchSearchResults();
          });
        }
      });

      // Initial load
      console.log('Running initial search...');
      fetchSearchResults();
    }
  }

})();