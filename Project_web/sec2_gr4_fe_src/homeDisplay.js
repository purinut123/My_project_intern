// home.js
document.addEventListener('DOMContentLoaded', async () => {
  await loadTop10Books();
  await loadRecentBooks();
  await loadHiatusBooks();
  await loadTopManga();
  await loadTopManhwa();
  await loadTopNovel();
});

// Load Top 10 Books
async function loadTop10Books() {
  try {
    const response = await fetch('/api/books/top10');
    const books = await response.json();
    
    const container = document.querySelector('#top10 .cards');
    container.innerHTML = books.map(book => createBookCard(book)).join('');
  } catch (error) {
    console.error('Error loading top 10 books:', error);
  }
}

// Load Recently Added Books
async function loadRecentBooks() {
  try {
    const response = await fetch('/api/books/recent');
    const books = await response.json();
    
    const container = document.querySelector('#upcoming .cards');
    container.innerHTML = books.map(book => createBookCard(book)).join('');
  } catch (error) {
    console.error('Error loading recent books:', error);
  }
}

// Load Hiatus Books
async function loadHiatusBooks() {
  try {
    const response = await fetch('/api/books/hiatus');
    const books = await response.json();
    
    const container = document.querySelector('#hiatus .cards');
    container.innerHTML = books.map(book => createBookCard(book)).join('');
  } catch (error) {
    console.error('Error loading hiatus books:', error);
  }
}

// Load Top Manga
async function loadTopManga() {
  try {
    const response = await fetch('/api/books/top-by-type/manga');
    const books = await response.json();
    
    const container = document.querySelector('.sidebar .board:nth-child(1) .board__list');
    container.innerHTML = books.map(book => createBoardItem(book)).join('');
  } catch (error) {
    console.error('Error loading top manga:', error);
  }
}

// Load Top Manhwa
async function loadTopManhwa() {
  try {
    const response = await fetch('/api/books/top-by-type/manhwa');
    const books = await response.json();
    
    const container = document.querySelector('.sidebar .board:nth-child(2) .board__list');
    container.innerHTML = books.map(book => createBoardItem(book)).join('');
  } catch (error) {
    console.error('Error loading top manhwa:', error);
  }
}

// Load Top Novel
async function loadTopNovel() {
  try {
    const response = await fetch('/api/books/top-by-type/novel');
    const books = await response.json();
    
    const container = document.querySelector('.sidebar .board:nth-child(3) .board__list');
    container.innerHTML = books.map(book => createBoardItem(book)).join('');
  } catch (error) {
    console.error('Error loading top novel:', error);
  }
}

// Create Book Card HTML
function createBookCard(book) {
  const imageUrl = book.CoverUrl || 'image/default_book.svg';
  // Convert to number first, then use toFixed
  const rating = book.avg_rating ? parseFloat(book.avg_rating).toFixed(1) : 'N/A';
  
  return `
    <article class="card" onclick="viewBookDetail('${book.Book_id}')">
      <div class="thumb" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
        <div class="card-overlay">
          <h3 class="card-title">${book.Title}</h3>
          <p class="card-rating">⭐ ${rating}</p>
        </div>
      </div>
    </article>
  `;
}

// Create Board Item HTML (for sidebar)
function createBoardItem(book) {
  const imageUrl = book.CoverUrl || 'image/default_book.svg';
  // Convert to number first, then use toFixed
  const rating = book.avg_rating ? parseFloat(book.avg_rating).toFixed(1) : 'N/A';
  
  return `
    <li class="board__item" onclick="viewBookDetail('${book.Book_id}')">
      <div class="mini-thumb" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"></div>
      <div class="mini-info">
        <div class="mini-title">${book.Title}</div>
        <div class="mini-meta">
          ${book.Type}<br/>
          Rating ${rating}
        </div>
      </div>
    </li>
  `;
}

// Navigate to book detail page
function viewBookDetail(bookId) {
  window.location.href = `detail.html?id=${bookId}`;
}

// Scroll function for horizontal lists
function scrollList(containerId, direction) {
  const list = document.querySelector(`#${containerId} .cards`);
  const cardWidth = list.querySelector('.card').offsetWidth + 12;
  const scrollAmount = direction === 'right' ? cardWidth * 3 : -cardWidth * 3;
  list.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}