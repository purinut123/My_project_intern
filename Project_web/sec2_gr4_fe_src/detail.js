// detail.js
const GIPHY_API_KEY = 'nZfwGGN9WVHAhGxtm6dHecLLrhmoD2af'; // Giphy api key

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');

  if (!bookId) {
    window.location.href = 'home.html';
    return;
  }

  if (window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  await loadBookDetail(bookId);
  await loadBookReviews(bookId);
  setupTabs(bookId);
});

async function loadBookDetail(bookId) {
  try {
    const response = await fetch(`/api/books-find/${bookId}`);
    const result = await response.json();

    if (!result.success || !result.data) {
      console.error('Book not found');
      document.querySelector('.detail-wrap').innerHTML = 
        '<p style="text-align:center; padding: 2rem;">Book not found</p>';
      return;
    }

    const book = result.data;
    window.currentBook = book;
    window.currentSynopsis = book.Synopsis;
    displayBookDetail(book);

  } catch (error) {
    console.error('Error loading book detail:', error);
    document.querySelector('.detail-wrap').innerHTML = 
      '<p style="text-align:center; padding: 2rem;">Error loading book details</p>';
  }
}

function displayBookDetail(book) {
  document.title = `${book.Title} — PANELIST`;
  document.querySelector('.book-title').textContent = book.Title;
  
  const coverDiv = document.querySelector('.detail-side .cover');
  if (book.CoverUrl) {
    coverDiv.style.backgroundImage = `url('${book.CoverUrl}')`;
    coverDiv.style.backgroundSize = 'cover';
    coverDiv.style.backgroundPosition = 'center';
    coverDiv.textContent = '';
  } else {
    coverDiv.textContent = 'COVER';
  }

  const infoDl = document.querySelector('.info-card:nth-of-type(1) dl');
  infoDl.innerHTML = `
    <dt>Type</dt><dd>${book.Type || 'N/A'}</dd>
    <dt>Status</dt><dd>${book.Status_B || 'N/A'}</dd>
    <dt>Author</dt><dd>${book.Author_Name || 'Unknown'}</dd>
    <dt>Publisher</dt><dd>${book.Publisher_Name || 'Unknown'}</dd>
    <dt>Genre</dt><dd>${book.Genre || 'N/A'}</dd>
    <dt>License</dt><dd>${book.Read_platform || 'N/A'}</dd>
    <dt>Original Name</dt><dd>${book.OG_title || book.Title}</dd>
  `;

  const mutedTextEl = document.getElementById('r-meta-muted');
  if (mutedTextEl) {
    mutedTextEl.textContent = `${book.Read_platform || 'N/A'} | ${book.Release_year || 'N/A'}`;
  }

  window.currentBookId = book.Book_id;
}

async function loadBookReviews(bookId) {
  try {
    const response = await fetch(`/api/reviews-find/${bookId}`);
    const result = await response.json();

    if (!result.success) {
      console.error('Failed to load reviews');
      return;
    }

    const reviews = result.data || [];
    const stats = calculateStats(reviews);
    
    updateStatistics(stats);
    updateScore(stats);
    displayReviewsList(reviews);

  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

function calculateStats(reviews) {
  if (reviews.length === 0) {
    return {
      avg_rating: 0,
      total_reviews: 0,
    };
  }

  const total = reviews.reduce((sum, r) => sum + (r.Score || 0), 0);
  const avg = total / reviews.length;

  return {
    avg_rating: avg.toFixed(2),
    total_reviews: reviews.length,
  };
}

function updateStatistics(stats) {
  const statsDl = document.querySelector('.info-card:nth-of-type(2) dl');
  statsDl.innerHTML = `
    <dt>Score</dt><dd>${stats.avg_rating} (by ${stats.total_reviews})</dd>
  `;
}

function updateScore(stats) {
  const scoreValueEl = document.getElementById('score-value-ribbon');
  const totalReviewsEl = document.getElementById('total-reviews-ribbon');

  if (scoreValueEl) {
    scoreValueEl.textContent = stats.avg_rating;
  }
  if (totalReviewsEl) {
    totalReviewsEl.textContent = stats.total_reviews;
  }
}

function displayReviewsList(reviews) {
  const reviewsContainer = document.getElementById('reviews-container');
  const synopsisTextEl = document.getElementById('synopsis-text');
  
  if (!reviewsContainer || !synopsisTextEl) {
    console.error("Reviews or Synopsis container not found.");
    return;
  }
  
  synopsisTextEl.textContent = window.currentSynopsis || 'No description available.';
  reviewsContainer.innerHTML = '';
  
  let reviewsHtml;
  if (reviews.length === 0) {
    reviewsHtml = `<p style="color: #9ca3af;">No reviews yet. Be the first to review!</p>`;
  } else {
    reviewsHtml = reviews.map(review => `
      <div style="background: var(--panel-2); border: 1px solid #2a303b; border-radius: 10px; padding: 12px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <img src="${review.ProfileUrl || './image/default_pfp.svg'}" 
               style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid #3a404b;" 
               alt="user" />
          <div style="flex: 1;">
            <strong>${review.Username || 'Anonymous'}</strong>
            <div style="color: #ffd700; font-size: 0.9rem;">⭐ ${review.Score}/5</div>
          </div>
        </div>
        <p style="color: #d1d5db; margin: 0 0 8px 0;">${review.Content || 'No review text provided.'}</p>
        ${review.GifUrl ? `
          <img src="${review.GifUrl}" 
               style="max-width: 250px; border-radius: 8px; border: 1px solid #3a404b;" 
               alt="reaction gif" />
        ` : ''}
      </div>
    `).join('');
  }

  reviewsContainer.innerHTML = `
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #2a303b;">
      <h3>Reviews (${reviews.length})</h3>
      ${reviewsHtml}
    </div>
  `;
}

function setupTabs(bookId) {
  const tabs = document.querySelectorAll('.tabs .tab');
  const panes = document.querySelectorAll('.pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      panes.forEach(p => p.classList.remove('is-visible'));

      const paneId = tab.dataset.pane;
      const targetPane = document.getElementById('pane-' + paneId);
      
      if (targetPane) {
        targetPane.classList.add('is-visible');
      }

      if (paneId === 'reviews') {
        showReviewForm(bookId);
      }

      if (paneId === 'detail') {
        loadBookReviews(bookId);
      }
    });
  });
}

function showReviewForm(bookId) {
  const reviewsPane = document.getElementById('pane-reviews');
  
  if (!window.Auth || !window.Auth.isLoggedIn()) {
    reviewsPane.innerHTML = `
      <div style="text-align: center; padding: 40px 0;">
        <h2>Write a Review</h2>
        <p style="color: #9ca3af; margin: 16px 0;">Please login to write a review</p>
        <a href="login.html" class="btn btn--primary">Login</a>
      </div>
    `;
    return;
  }

  const user = window.Auth.getUser();

  reviewsPane.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <h2>Write a Review</h2>
      <p style="color: #9ca3af; margin-bottom: 24px;">
        Reviewing as <strong>${user?.username || 'User'}</strong>
      </p>
      
      <form id="review-form" class="card" style="padding: 20px;">
        <label class="field" style="margin-bottom: 16px;">
          <span class="label">Rating (1-5) *</span>
          <input 
            id="review-score" 
            type="number" 
            min="1" 
            max="5" 
            class="input" 
            placeholder="Rate from 1 to 5" 
            required 
          />
        </label>

        <label class="field" style="margin-bottom: 16px;">
          <span class="label">Your Review *</span>
          <textarea 
            id="review-content" 
            class="textarea" 
            rows="6" 
            placeholder="Write your review here..." 
            required
            style="resize: vertical; min-height: 120px;"
          ></textarea>
        </label>

        <!-- GIF Search Section -->
        <div class="field" style="margin-bottom: 16px;">
          <span class="label">Add a GIF Reaction (Optional)</span>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <input 
              id="gif-search" 
              type="text" 
              class="input" 
              placeholder="Search for a GIF (e.g., 'amazing', 'love', 'excited')..." 
              style="flex: 1;"
            />
            <button type="button" id="search-gif-btn" class="btn btn--ghost">Search</button>
          </div>
          
          <!-- Selected GIF Preview -->
          <div id="selected-gif" style="display: none; margin-bottom: 12px;">
            <p style="font-size: 0.9rem; color: #9ca3af; margin-bottom: 8px;">Selected GIF:</p>
            <div style="position: relative; display: inline-block;">
              <img id="selected-gif-img" style="max-width: 200px; border-radius: 8px; border: 2px solid #3a404b;" />
              <button 
                type="button" 
                id="remove-gif-btn" 
                style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.8); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 18px; line-height: 1; font-weight: bold;"
              >×</button>
            </div>
          </div>

          <!-- GIF Results Grid -->
          <div id="gif-results" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-height: 300px; overflow-y: auto;"></div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button type="submit" class="btn btn--primary">Submit Review</button>
          <button type="button" class="btn btn--ghost" onclick="document.querySelector('[data-pane=detail]').click()">
            Cancel
          </button>
        </div>

        <p id="review-status" style="margin-top: 12px; color: #9ca3af;"></p>
      </form>
    </div>
  `;

  // Client-side validation

  // ⭐ CRITICAL FIX: Ensure this validation block is present and correct

  setupGiphySearch();

  const form = document.getElementById('review-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitReview(bookId);
  });
}

function setupGiphySearch() {
  let selectedGifUrl = null;

  const searchBtn = document.getElementById('search-gif-btn');
  const searchInput = document.getElementById('gif-search');
  const resultsDiv = document.getElementById('gif-results');
  const selectedGifDiv = document.getElementById('selected-gif');
  const selectedGifImg = document.getElementById('selected-gif-img');
  const removeGifBtn = document.getElementById('remove-gif-btn');

  searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) {
      resultsDiv.innerHTML = '<p style="color: #9ca3af; padding: 20px; text-align: center; grid-column: 1/-1;">Enter a search term</p>';
      return;
    }

    try {
      resultsDiv.innerHTML = '<p style="color: #9ca3af; padding: 20px; text-align: center; grid-column: 1/-1;">Loading GIFs...</p>';
      
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=60`
      );
      const data = await response.json();

      if (data.data.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px; grid-column: 1/-1;">No GIFs found. Try another search!</p>';
        return;
      }

      resultsDiv.innerHTML = data.data.map(gif => `
        <img 
          src="${gif.images.fixed_height_small.url}" 
          data-gif-url="${gif.images.downsized_medium.url}"
          style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid #3a404b; transition: transform 0.2s;"
          class="gif-option"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        />
      `).join('');

      document.querySelectorAll('.gif-option').forEach(img => {
        img.addEventListener('click', () => {
          selectedGifUrl = img.dataset.gifUrl;
          selectedGifImg.src = selectedGifUrl;
          selectedGifImg.dataset.gifUrl = selectedGifUrl;
          selectedGifDiv.style.display = 'block';
          resultsDiv.innerHTML = '';
          searchInput.value = '';
        });
      });

    } catch (error) {
      console.error('Giphy search error:', error);
      resultsDiv.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px; grid-column: 1/-1;">Error loading GIFs. Check your API key.</p>';
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchBtn.click();
    }
  });

  removeGifBtn.addEventListener('click', () => {
    selectedGifUrl = null;
    selectedGifDiv.style.display = 'none';
    selectedGifImg.src = '';
    delete selectedGifImg.dataset.gifUrl;
  });
}

async function submitReview(bookId) {
  const score = document.getElementById('review-score').value;
  const content = document.getElementById('review-content').value;
  const gifUrl = document.getElementById('selected-gif-img')?.dataset?.gifUrl || null;
  const statusEl = document.getElementById('review-status');

  if (!score || !content) {
    statusEl.textContent = 'Please fill in all required fields';
    statusEl.style.color = '#ef4444';
    return;
  }

  if (score < 1 || score > 5) {
    statusEl.textContent = 'Rating must be between 1 and 5';
    statusEl.style.color = '#ef4444';
    return;
  }

  try {
    statusEl.textContent = 'Submitting...';
    statusEl.style.color = '#9ca3af';

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      statusEl.textContent = 'Authentication error. Please login again.';
      statusEl.style.color = '#ef4444';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    const response = await fetch('/api/reviews-add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bookId: bookId,
        score: parseInt(score),
        content: content,
        gifUrl: gifUrl
      })
    });

    const result = await response.json();

    if (result.success) {
      statusEl.textContent = '✓ Review submitted successfully!';
      statusEl.style.color = '#22c55e';
      
      setTimeout(() => {
        document.querySelector('[data-pane="detail"]').click();
        loadBookReviews(bookId);
      }, 2000);
    } else {
      statusEl.textContent = result.error || 'Failed to submit review';
      statusEl.style.color = '#ef4444';
    }

  } catch (error) {
    console.error('Error submitting review:', error);
    statusEl.textContent = 'Error submitting review. Please try again.';
    statusEl.style.color = '#ef4444';
  }
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}