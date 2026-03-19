// Function to handle the view switching in the sidebar
function setupViewSwitching() {
  document.querySelectorAll('.profile-nav .navpfp').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.profile-nav .navpfp').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      const view = link.dataset.view;
      document.querySelectorAll('.profile-main .view').forEach(v => v.classList.add('hidden'));
      document.getElementById('view-' + view).classList.remove('hidden');
      
      // ✅ Load data when switching to manage views
      if (view === 'manage-books') {
        loadBooks();
      } else if (view === 'manage-users') {
        loadUsers();
      }
    });
  });
}

// Function to handle the Logout action
function setupLogout() {
  const logoutLink = document.getElementById('btnLogout'); 
  
  // Guard clause to prevent errors if the button doesn't exist
  if (!logoutLink) return; 

  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Clear local storage using the global Auth helper
    if (window.Auth) {
        Auth.logout();
    } else {
        console.error("Auth helper not available to clear local storage.");
    }

    // Redirect the user
    window.location.href = 'home.html'; 
  });
}

// Fetch books from API
async function fetchBooks(page = 1, search = '') {
  try {
    const params = new URLSearchParams({
      page: page,
      limit: 10,
      search: search
    });
    
    const res = await fetch(`/api/book-list?${params}`);
    const result = await res.json();
    
    if (!res.ok || !result.success) {
      console.error('Failed to fetch books:', result);
      return { data: [], pagination: { total: 0, totalPages: 0 } };
    }
    
    return result;
  } catch (err) {
    console.error('Error fetching books:', err);
    return { data: [], pagination: { total: 0, totalPages: 0 } };
  }
}

// Render book table with real data
function renderBookTable(rows, pagination) {
  const tpl = document.getElementById('tpl-book-row');
  const tbody = document.getElementById('bookTbody');
  if (!tpl || !tbody) return;

  tbody.innerHTML = '';
  
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No books found</td></tr>';
    return;
  }
  
  rows.forEach(book => {
    const tr = tpl.content.cloneNode(true);
    tr.querySelector('.id').textContent = book.Book_id;
    tr.querySelector('.title').textContent = book.Title;
    tr.querySelector('.type').textContent = book.Type;
    tr.querySelector('.status').textContent = book.Status_B;
    tr.querySelector('.rating').textContent = book.Rating;
    tr.querySelector('.updated').textContent = book.Release_year || 'N/A';
    
    // Add edit button functionality
    const editBtn = tr.querySelector('.actions .btn--ghost');
    editBtn.onclick = () => {
      window.location.href = `edit-book.html?id=${book.Book_id}`;
    };
    
    // In renderBookTable function:
    const deleteBtn = tr.querySelector('.actions .btn--danger');
    deleteBtn.onclick = async () => {
      if (confirm(`Delete "${book.Title}"? This action cannot be undone!`)) {
        try {
          const res = await fetch(`/api/book-del/${book.Book_id}`, {
            method: 'DELETE'
          });

          const result = await res.json();

          if (!res.ok || !result.success) {
            alert('Failed to delete book: ' + (result.error || 'Unknown error'));
            return;
          }

          alert('Book deleted successfully!');
          // Reload the books list
          loadBooks();
        } catch (err) {
          console.error('Delete error:', err);
          alert('Error deleting book');
        }
      }
    };
    
    tbody.appendChild(tr);
  });
  
  // Update pagination info
  updatePagination(pagination);
}

// Update pagination display
function updatePagination(pagination) {
  const tableWrap = document.querySelector('#view-manage-books .table-wrap');
  let paginationDiv = tableWrap.querySelector('.pagination');
  
  // Remove old pagination if exists
  if (paginationDiv) {
    paginationDiv.remove();
  }
  
  // Create new pagination
  paginationDiv = document.createElement('div');
  paginationDiv.className = 'pagination';
  paginationDiv.innerHTML = `
    <span>Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total books)</span>
    <div class="pagination-buttons">
      <button class="btn btn--ghost xsmall" id="prevPage" ${pagination.page === 1 ? 'disabled' : ''}>Previous</button>
      <button class="btn btn--ghost xsmall" id="nextPage" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;
  
  tableWrap.appendChild(paginationDiv);
  
  // Add pagination button listeners
  document.getElementById('prevPage')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadBooks();
    }
  });
  
  document.getElementById('nextPage')?.addEventListener('click', () => {
    if (currentPage < pagination.totalPages) {
      currentPage++;
      loadBooks();
    }
  });
}

// Global variables for pagination and search
let currentPage = 1;
let currentSearch = '';

// Load books with current filters
async function loadBooks() {
  const result = await fetchBooks(currentPage, currentSearch);
  renderBookTable(result.data, result.pagination);
}

// Setup book search
function setupBookSearch() {
  const searchInput = document.getElementById('bookSearch');
  if (!searchInput) return;
  
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    // Debounce search - wait 500ms after user stops typing
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value;
      currentPage = 1; // Reset to first page on new search
      loadBooks();
    }, 500);
  });
}
// ----- User List FETCH AND RENDERING -----

// Fetch users from API
async function fetchUsers(page = 1, search = '') {
  try {
    const params = new URLSearchParams({
      page: page,
      limit: 10,
      search: search
    });
    
    const res = await fetch(`/api/user-list?${params}`);
    const result = await res.json();
    
    if (!res.ok || !result.success) {
      console.error('Failed to fetch users:', result);
      return { data: [], pagination: { total: 0, totalPages: 0 } };
    }
    
    return result;
  } catch (err) {
    console.error('Error fetching users:', err);
    return { data: [], pagination: { total: 0, totalPages: 0 } };
  }
}

// Render user table with real data
function renderUserTable(rows, pagination) {
  const tpl = document.getElementById('tpl-user-row');
  const tbody = document.getElementById('userTbody');
  if (!tpl || !tbody) return;

  tbody.innerHTML = '';
  
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found</td></tr>';
    return;
  }
  
  rows.forEach(user => {
    const tr = tpl.content.cloneNode(true);
    tr.querySelector('.id').textContent = user.User_id;
    tr.querySelector('.username').textContent = user.Username;
    tr.querySelector('.role').textContent = user.Role;
    tr.querySelector('.email').textContent = user.Email;
    tr.querySelector('.ustatus').textContent = user.Status_A;
    
    // Add edit button functionality
    const editBtn = tr.querySelector('.actions .btn--ghost');
    editBtn.onclick = () => {
      window.location.href = `edit-user.html?id=${user.User_id}`;
    };
    
    // In renderUserTable function:
    const deleteBtn = tr.querySelector('.actions .btn--danger');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
      if (confirm(`Delete user "${user.Username}"? This action cannot be undone!`)) {
        try {
          const res = await fetch(`/api/user-del/${user.User_id}`, {
            method: 'DELETE'
          });

          const result = await res.json();

          if (!res.ok || !result.success) {
            alert('Failed to delete user: ' + (result.error || 'Unknown error'));
            return;
          }

          alert('User deleted successfully!');
          // Reload the users list
          loadUsers();
        } catch (err) {
          console.error('Delete error:', err);
          alert('Error deleting user');
        }
      }
    };
    
    tbody.appendChild(tr);
  });
  
  // Update pagination info
  updateUserPagination(pagination);
}

// Update user pagination display
function updateUserPagination(pagination) {
  const tableWrap = document.querySelector('#view-manage-users .table-wrap');
  let paginationDiv = tableWrap.querySelector('.pagination');
  
  // Remove old pagination if exists
  if (paginationDiv) {
    paginationDiv.remove();
  }
  
  // Create new pagination
  paginationDiv = document.createElement('div');
  paginationDiv.className = 'pagination';
  paginationDiv.innerHTML = `
    <span>Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total users)</span>
    <div class="pagination-buttons">
      <button class="btn btn--ghost xsmall" id="prevUserPage" ${pagination.page === 1 ? 'disabled' : ''}>Previous</button>
      <button class="btn btn--ghost xsmall" id="nextUserPage" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;
  
  tableWrap.appendChild(paginationDiv);
  
  // Add pagination button listeners
  document.getElementById('prevUserPage')?.addEventListener('click', () => {
    if (currentUserPage > 1) {
      currentUserPage--;
      loadUsers();
    }
  });
  
  document.getElementById('nextUserPage')?.addEventListener('click', () => {
    if (currentUserPage < pagination.totalPages) {
      currentUserPage++;
      loadUsers();
    }
  });
}

// Global variables for user pagination and search
let currentUserPage = 1;
let currentUserSearch = '';

// Load users with current filters
async function loadUsers() {
  const result = await fetchUsers(currentUserPage, currentUserSearch);
  renderUserTable(result.data, result.pagination);
}

// Setup user search
function setupUserSearch() {
  const searchInput = document.getElementById('userSearch');
  if (!searchInput) return;
  
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    // Debounce search - wait 500ms after user stops typing
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentUserSearch = e.target.value;
      currentUserPage = 1; // Reset to first page on new search
      loadUsers();
    }, 500);
  });
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
  // 1. Run Auth Guard and setup UI based on logged-in user
  if (window.Auth) {
    Auth.requireAuth(); // Redirects if not logged in
    
    const user = Auth.getUser();
    // Set the body data-role for CSS hiding of admin-only content
    if (user && user.role) {
        document.body.setAttribute('data-role', user.role.toLowerCase());
    }
    const nameEl = document.querySelector('.profile-card .name');
    const metaEl = document.querySelector('.profile-card .meta');
    const avatarEl = document.getElementById('pfpAvatar');
    
    if (nameEl) {
      nameEl.textContent = `${user.username} (${user.role})`;
    }
    
    if (metaEl) {
      metaEl.textContent = `${user.email}`;
    }
    
    // Set avatar background image if profileUrl exists
    if (avatarEl && user.profileUrl) {
      avatarEl.src = user.profileUrl; 
    } else if (avatarEl) {
      avatarEl.src = './image/default_pfp.svg';
    }
  }
  
  // 2. Run Event Listeners
  setupViewSwitching();
  setupLogout(); // THIS IS THE CALL THAT ATTACHES THE LISTENER
  setupBookSearch();
  setupUserSearch();
  loadBooks(); // Initial load of books
});