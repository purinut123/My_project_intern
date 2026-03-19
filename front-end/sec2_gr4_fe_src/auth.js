// ===== auth helper (CORRECTED) =====
(function () {
  const AUTH_KEY = 'authToken';
  const USER_KEY = 'authUser';

  function isLoggedIn() {
    return !!localStorage.getItem(AUTH_KEY);
  }

  function getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  function login(token, userData) {
    localStorage.setItem(AUTH_KEY, token);
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // New combined function to handle all UI updates (runs after DOM is ready)
  function applyAuthUI() {
    const authed = isLoggedIn();
    const user = getUser(); // Get user data inside this function

    // 1. Reveal/Hide header items (auth-only/unauth-only)
    document.querySelectorAll('.auth-only').forEach(el => {
      el.style.display = authed ? '' : 'none';
    });
    document.querySelectorAll('.unauth-only').forEach(el => {
      el.style.display = authed ? 'none' : '';
    });

    // 2. Update profile name and image if logged in
    if (user) {
      // Update profile image
      const profileImageEl = document.getElementById('profileImage');
      
      // Check if the element exists AND if ProfileUrl exists
      if (profileImageEl && user.profileUrl) { 
        profileImageEl.src = user.profileUrl;
      } else if (profileImageEl) {
        // Use the generic placeholder if URL is missing, but element exists
        profileImageEl.src = './image/default_pfp.svg'; 
      }
      
      // 3. Set role attribute (for admin-only views)
      if (user.role) {
        document.body.setAttribute('data-role', user.role.toLowerCase());
      }
    } else {
      // If logged out, ensure admin role is cleared
      document.body.removeAttribute('data-role');
    }
  }

  // guard for protected pages
  function requireAuth(options = {}) { 
    const authed = isLoggedIn(); 
    if (!authed) { 
      const next = options.next || location.pathname + location.search;
      location.href = 'login.html?next=' + encodeURIComponent(next);
    }
  }

  // make globally accessible
  window.Auth = { isLoggedIn, getUser, login, logout, applyAuthUI, requireAuth };
  
  // Run UI toggle on every page after the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAuthUI);
  } else {
    applyAuthUI();
  }
})();