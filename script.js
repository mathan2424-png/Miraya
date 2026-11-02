/**
 * VELOURA — Senior Developer Production Architecture
 * Master Application Script
 */

(function () {
  'use strict';

  // ==========================================
  // 1. HEADER & NAVIGATION MODULE
  // ==========================================
  const HeaderModule = {
    init() {
      this.navbar = document.getElementById('navbar');
      this.navToggle = document.getElementById('navToggle');
      this.navLinks = document.getElementById('navLinks');

      if (this.navbar) {
        this.bindScroll();
      }
      if (this.navToggle && this.navLinks) {
        this.bindMobileMenu();
      }
      this.highlightActiveLink();
    },

    bindScroll() {
      const handleScroll = () => {
        if (window.scrollY > 40) {
          this.navbar.classList.add('is-scrolled');
        } else {
          this.navbar.classList.remove('is-scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    },

    bindMobileMenu() {
      if (!this.navToggle || !this.navLinks) return;

      this.navToggle.addEventListener('click', () => {
        this.navLinks.classList.toggle('is-open');
      });

      const links = this.navLinks.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          this.navLinks.classList.remove('is-open');
        });
      });
    },

    highlightActiveLink() {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const links = document.querySelectorAll('.nav-links a');

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === 'index.html' && href === '#home')) {
          link.classList.add('active');
        }
      });
    }
  };

  // ==========================================
  // 2. SCROLL REVEAL MODULE (PROGRESSIVE ENHANCEMENT)
  // ==========================================
  const ScrollRevealModule = {
    init() {
      const reveals = document.querySelectorAll('.reveal');
      if (!reveals.length) return;

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

        reveals.forEach(el => observer.observe(el));
      }

      // Fail-safe load trigger to guarantee 100% visibility across all browsers
      window.addEventListener('load', () => {
        reveals.forEach(el => el.classList.add('in-view'));
      });
    }
  };

  // ==========================================
  // 3. REAL DYNAMIC E-COMMERCE CART MODULE
  // ==========================================
  const EcommerceModule = {
    STORAGE_KEY: 'miraya_cart',

    init() {
      this.ensureInitialCart();
      this.updateHeaderBadge();
      this.updateWishlistCount();
      this.bindCartButtons();
      this.bindPdpAddCartButton();
      this.bindWishlistButtons();
      this.bindProductClickHandlers();
      this.initLiveSearch();
      
      if (document.getElementById('cartContainer')) {
        this.renderCartPage();
      }
    },

    bindProductClickHandlers() {
      document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.add-cart') || target.closest('.wishlist-btn') || target.closest('.quick-view') || target.closest('.btn-add-cart') || target.closest('.btn-buy-now')) {
          return;
        }

        const mediaClick = target.closest('.product-media');
        const titleClick = target.closest('.product-info h4') || target.closest('.product-card h4');
        const cardImgClick = target.closest('.product-card img');

        if (mediaClick || titleClick || cardImgClick) {
          window.location.href = 'product-details.html';
        }
      });
    },

    ensureInitialCart() {
      const existing = localStorage.getItem(this.STORAGE_KEY);
      if (!existing) {
        const defaultCart = [
          {
            id: 'kanchipuram-cb001',
            title: 'Pure Zari Kanchipuram Silk',
            variant: 'Color: Crimson Gold Zari',
            price: 38500,
            qty: 1,
            image: 'images/pure gold.png'
          },
          {
            id: 'chiffon-persimmon',
            title: 'Festive Sheer Chiffon Saree',
            variant: 'Color: Sunset Persimmon',
            price: 18125,
            qty: 1,
            image: 'images/semi transparen.png'
          }
        ];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultCart));
      }
    },

    getCart() {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    },

    saveCart(cart) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
      this.updateHeaderBadge();
    },

    updateHeaderBadge() {
      const cart = this.getCart();
      const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0);
      const countElems = document.querySelectorAll('.cart-count');
      countElems.forEach(el => {
        el.textContent = totalCount;
        el.style.transform = 'scale(1.3)';
        setTimeout(() => el.style.transform = 'scale(1)', 250);
      });
    },

    addToCart(product) {
      const cart = this.getCart();
      const existingItem = cart.find(i => i.id === product.id || i.title === product.title);
      
      if (existingItem) {
        existingItem.qty += product.qty || 1;
      } else {
        cart.push({
          id: product.id || 'prod-' + Date.now(),
          title: product.title || 'Pure Silk Saree',
          variant: product.variant || 'Handloom Silk',
          price: product.price || 25000,
          qty: product.qty || 1,
          image: product.image || 'images/pure gold.png'
        });
      }

      this.saveCart(cart);
      this.showToast(`"${product.title}" added to your Shopping Bag!`);
    },

    showToast(msg) {
      let toast = document.getElementById('mirayaToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mirayaToast';
        toast.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 1000; background: var(--wine); color: #fff; padding: 14px 24px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); font-family: var(--font-body); font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 14px; transform: translateY(100px); opacity: 0; transition: all 0.4s ease;';
        document.body.appendChild(toast);
      }

      toast.innerHTML = `<span>${msg}</span> <a href="cart.html" style="color: var(--gold-light); font-weight: 600; text-decoration: underline;">View Bag →</a>`;
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';

      setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
      }, 3500);
    },

    bindCartButtons() {
      const addCartBtns = document.querySelectorAll('.product-card .add-cart');
      addCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const card = btn.closest('.product-card');
          if (card) {
            const title = card.querySelector('h4')?.textContent || 'Pure Silk Saree';
            const priceText = card.querySelector('.price-now')?.textContent || '₹25,000';
            const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 25000;
            const img = card.querySelector('img')?.getAttribute('src') || 'images/pure gold.png';

            this.addToCart({
              id: title.toLowerCase().replace(/\s+/g, '-'),
              title: title,
              variant: 'Heritage Silk Weave',
              price: price,
              qty: 1,
              image: img
            });

            // Button feedback
            const originalText = btn.textContent;
            btn.textContent = 'Added ✓';
            btn.style.background = 'var(--wine)';
            btn.style.color = '#fff';
            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.style.color = '';
            }, 1500);
          }
        });
      });
    },

    bindPdpAddCartButton() {
      const pdpAddBtn = document.querySelector('.btn-add-cart');
      if (pdpAddBtn) {
        pdpAddBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const title = document.querySelector('.pdp-title')?.textContent || 'Pure Zari Kanchipuram Silk Saree';
          const priceText = document.querySelector('.pdp-price-now')?.textContent || '₹38,500';
          const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 38500;
          const img = document.getElementById('pdpMainImg')?.getAttribute('src') || 'images/pure gold.png';
          const qtyVal = parseInt(document.getElementById('qtyDisplay')?.textContent, 10) || 1;

          this.addToCart({
            id: 'kanchipuram-cb001',
            title: title,
            variant: 'Color: Crimson Gold Zari',
            price: price,
            qty: qtyVal,
            image: img
          });
        });
      }
    },

    updateWishlistCount() {
      try {
        const wishlist = JSON.parse(localStorage.getItem('miraya_wishlist')) || [];
        const count = wishlist.length;
        const badges = document.querySelectorAll('.wishlist-count');
        badges.forEach(b => {
          b.textContent = count;
          b.style.transform = 'scale(1.3)';
          setTimeout(() => b.style.transform = 'scale(1)', 250);
        });
      } catch (err) {}
    },

    syncWishlistButtonsState() {
      try {
        const wishlist = JSON.parse(localStorage.getItem('miraya_wishlist')) || [];
        const wishlistBtns = document.querySelectorAll('.wishlist-btn, .pdp-wishlist-btn');

        wishlistBtns.forEach(btn => {
          const card = btn.closest('.product-card') || btn.closest('.saree-card') || btn.closest('.kids-card') || document.querySelector('.pdp-main');
          const title = card ? (card.querySelector('h4, .pdp-title')?.textContent?.trim() || '') : '';
          const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-');

          const isSaved = wishlist.some(item => item.id === id || item.title === title);

          if (isSaved) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      } catch (e) {}
    },

    bindWishlistButtons() {
      this.syncWishlistButtonsState();

      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.wishlist-btn, .pdp-wishlist-btn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.product-card') || btn.closest('.saree-card') || btn.closest('.kids-card') || document.querySelector('.pdp-main');
        let title = 'Silk Saree Item';
        let price = 35000;
        let image = 'images/pure gold.png';
        let badge = 'Heirloom Handloom';

        if (card) {
          title = card.querySelector('h4, .pdp-title')?.textContent?.trim() || title;
          const priceEl = card.querySelector('.price-now, .pdp-price-now, .saree-price');
          if (priceEl) {
            const cleaned = priceEl.textContent.replace(/[^0-9]/g, '');
            price = parseInt(cleaned, 10) || price;
          }
          image = card.querySelector('img')?.getAttribute('src') || image;
          badge = card.querySelector('.badge')?.textContent?.trim() || badge;
        }

        const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let wishlist = JSON.parse(localStorage.getItem('miraya_wishlist')) || [];
        const isAlreadySaved = wishlist.some(i => i.id === id || i.title === title);

        if (isAlreadySaved) {
          wishlist = wishlist.filter(i => i.id !== id && i.title !== title);
          localStorage.setItem('miraya_wishlist', JSON.stringify(wishlist));
          btn.classList.remove('active');
          this.showToast(`"${title}" removed from your Wishlist.`);
        } else {
          wishlist.push({ id, title, price, image, badge });
          localStorage.setItem('miraya_wishlist', JSON.stringify(wishlist));
          btn.classList.add('active');
          this.showToast(`"${title}" added to your Wishlist ❤️`);
        }

        this.updateWishlistCount();
      });
    },

    initLiveSearch() {
      if (!document.getElementById('searchModal')) {
        const modal = document.createElement('div');
        modal.className = 'search-modal-backdrop';
        modal.id = 'searchModal';
        modal.innerHTML = `
          <div class="search-modal-card">
            <button class="search-modal-close" id="searchModalClose" aria-label="Close search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="search-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="liveSearchInput" placeholder="Search Kanchipuram, Banarasi, Soft Silks, Lehengas..." autocomplete="off">
            </div>
            <div class="search-tags">
              <span class="search-tag-label">Popular Searches:</span>
              <span class="search-tag" data-query="kanchipuram">Kanchipuram</span>
              <span class="search-tag" data-query="banarasi">Banarasi</span>
              <span class="search-tag" data-query="soft silk">Soft Silk</span>
              <span class="search-tag" data-query="mysore">Mysore Crepe</span>
              <span class="search-tag" data-query="tussar">Tussar</span>
              <span class="search-tag" data-query="chiffon">Chiffon</span>
            </div>
            <div class="search-results-container">
              <div class="search-results-grid" id="searchResultsGrid">
                <!-- Dynamic search results -->
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const modal = document.getElementById('searchModal');
      const closeBtn = document.getElementById('searchModalClose');
      const input = document.getElementById('liveSearchInput');
      const grid = document.getElementById('searchResultsGrid');

      const products = [
        { title: 'Pure Zari Kanchipuram Silk Saree', price: '₹38,500', category: 'kanchipuram silk', image: 'images/pure gold.png', link: 'product-details.html' },
        { title: 'Banarasi Katan Silk Brocade Saree', price: '₹42,000', category: 'banarasi brocade', image: 'images/banarashi.png', link: 'product-details.html' },
        { title: 'Mysore Crepe Silk Zarwork Saree', price: '₹31,050', category: 'mysore silk', image: 'images/Mysore.png', link: 'product-details.html' },
        { title: 'Fluid Sheen Soft Silk Saree', price: '₹24,800', category: 'soft silk', image: 'images/soft silk.png', link: 'product-details.html' },
        { title: 'Geometric Ikats & Patola Silk Saree', price: '₹29,700', category: 'patola ikat', image: 'images/ikat.png', link: 'product-details.html' },
        { title: 'Wild Tussar Handloom Silk Saree', price: '₹22,500', category: 'tussar silk', image: 'images/Tusser.png', link: 'product-details.html' },
        { title: 'Jaipur Atelier Embroidered Silk Saree', price: '₹34,200', category: 'embroidered silk', image: 'images/embroidered silk.png', link: 'product-details.html' },
        { title: 'Festive Sheer Chiffon Saree', price: '₹18,125', category: 'chiffon', image: 'images/semi transparen.png', link: 'product-details.html' },
        { title: 'Kanchi Half Fine Brocade Silk Saree', price: '₹27,500', category: 'kanchi brocade', image: 'images/image.png', link: 'product-details.html' }
      ];

      const renderResults = (query = '') => {
        const q = query.toLowerCase().trim();
        const filtered = products.filter(p => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

        if (filtered.length === 0) {
          grid.innerHTML = `<div class="search-no-results" style="grid-column: 1 / -1;">No matching heirloom sarees found for "${query}"</div>`;
          return;
        }

        grid.innerHTML = filtered.map(p => `
          <a href="${p.link}" class="search-result-item">
            <img src="${p.image}" alt="${p.title}" class="search-result-img">
            <div class="search-result-info">
              <div class="search-result-title">${p.title}</div>
              <div class="search-result-price">${p.price}</div>
            </div>
          </a>
        `).join('');
      };

      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('a[aria-label="Search"], .search-btn, #searchBtn');
        if (trigger) {
          e.preventDefault();
          modal.classList.add('is-open');
          renderResults('');
          setTimeout(() => input.focus(), 100);
        }
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('is-open'));
      }

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('is-open');
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
          modal.classList.remove('is-open');
        }
      });

      if (input) {
        input.addEventListener('input', (e) => renderResults(e.target.value));
      }

      document.querySelectorAll('.search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const q = tag.dataset.query || '';
          if (input) input.value = q;
          renderResults(q);
        });
      });
    },

    initPolicyModal() {
      if (!document.getElementById('policyModal')) {
        const modal = document.createElement('div');
        modal.className = 'policy-modal-backdrop';
        modal.id = 'policyModal';
        modal.innerHTML = `
          <div class="policy-modal-card">
            <button class="policy-modal-close" id="policyModalClose" aria-label="Close policy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h3 class="policy-modal-title" id="policyModalTitle">Store Policy</h3>
            <div class="policy-modal-body" id="policyModalBody">
              <!-- Content loaded dynamically -->
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const modal = document.getElementById('policyModal');
      const closeBtn = document.getElementById('policyModalClose');
      const titleEl = document.getElementById('policyModalTitle');
      const bodyEl = document.getElementById('policyModalBody');

      const policyData = {
        privacy: {
          title: 'Privacy Policy',
          content: `
            <h4>1. Information Collection & Usage</h4>
            <p>At MIRAYA Atelier, we prioritize your privacy. We collect essential information such as name, contact address, and order details strictly to process orders and provide bespoke client services. We never sell or share your personal data with third-party marketers.</p>
            <h4>2. Payment & Data Security</h4>
            <p>All online transactions are encrypted with enterprise-grade 256-bit SSL encryption. Payment information is securely processed through certified gateways; we do not store sensitive credit card numbers or UPI PINs on our servers.</p>
            <h4>3. Cookie & Preference Management</h4>
            <p>We use localized browser storage strictly to preserve your active shopping bag items and saved wishlist heirlooms for a seamless shopping experience across visits.</p>
          `
        },
        terms: {
          title: 'Terms & Conditions',
          content: `
            <h4>1. Authenticity & Handloom Guarantee</h4>
            <p>Every piece in the MIRAYA collection is guaranteed 100% authentic pure silk certified by Silk Mark India. Due to the handcrafted nature of traditional handloom weaving, subtle variations in thread texture and zarwork are genuine hallmarks of artisan handcrafting.</p>
            <h4>2. Pricing & Currency</h4>
            <p>All prices listed on the site are in Indian Rupees (INR) inclusive of applicable taxes. Prices are subject to revision without prior notice, but orders placed prior to revisions will be honored at the purchased rate.</p>
            <h4>3. Atelier Service Terms</h4>
            <p>Custom blouse stitching, saree fall edging, and embroidery customization orders are tailored specifically to measurements provided by the client and cannot be returned once stitched.</p>
          `
        },
        returns: {
          title: 'Return & Refund Policy',
          content: `
            <h4>1. 7-Day Easy Exchange Policy</h4>
            <p>If you are not fully satisfied with your purchase, you may initiate an exchange or return request within 7 days of receiving your package, provided the product remains unstitched, unworn, with original tags intact.</p>
            <h4>2. Reverse Pickup & Inspection</h4>
            <p>Our concierge team will arrange a doorstep reverse pickup anywhere in India. Once received and inspected at our Jaipur quality warehouse, your replacement item or refund will be processed immediately.</p>
            <h4>3. Refund Timeline</h4>
            <p>Approved refunds are credited to the original payment method within 3 to 5 business days upon successful quality verification.</p>
          `
        },
        shipping: {
          title: 'Shipping & Delivery Policy',
          content: `
            <h4>1. Complimentary Express Shipping</h4>
            <p>MIRAYA provides free express shipping across all major cities and pincodes in India for all orders above ₹2,000.</p>
            <h4>2. Delivery Timelines</h4>
            <p>Standard domestic orders are dispatched within 24 to 48 hours and delivered within 3 to 5 business days. Customized or hand-stitched orders take 7 to 10 business days.</p>
            <h4>3. International Delivery</h4>
            <p>Worldwide international shipping is available via DHL / FedEx with live tracking provided via SMS and Email upon dispatch.</p>
          `
        },
        cancellation: {
          title: 'Cancellation Policy',
          content: `
            <h4>1. Order Cancellation</h4>
            <p>Orders can be cancelled free of charge within 24 hours of placement or prior to dispatch, whichever comes first.</p>
            <h4>2. Post-Dispatch Requests</h4>
            <p>Once dispatched, orders cannot be cancelled mid-transit. However, you may initiate a return upon receipt under our 7-day Return Policy.</p>
          `
        }
      };

      document.addEventListener('click', (e) => {
        const link = e.target.closest('.policy-link');
        if (link) {
          e.preventDefault();
          const key = link.dataset.policy || 'privacy';
          const data = policyData[key] || policyData.privacy;
          if (titleEl) titleEl.textContent = data.title;
          if (bodyEl) bodyEl.innerHTML = data.content;
          if (modal) modal.classList.add('is-open');
        }
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('is-open'));
      }

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('is-open');
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
          modal.classList.remove('is-open');
        }
      });
    },

    renderCartPage() {
      const container = document.getElementById('cartContainer');
      if (!container) return;

      const cart = this.getCart();
      const emptyMsg = document.getElementById('emptyCartMsg');
      const tableHeader = document.querySelector('.cart-table-header');
      
      // Clear current rows
      const existingRows = container.querySelectorAll('.cart-item-row');
      existingRows.forEach(r => r.remove());

      if (!cart || cart.length === 0) {
        if (tableHeader) tableHeader.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        this.updateCartSummary(0);
        return;
      }

      if (tableHeader) tableHeader.style.display = 'grid';
      if (emptyMsg) emptyMsg.style.display = 'none';

      let total = 0;

      cart.forEach((item, index) => {
        const rowTotal = item.price * item.qty;
        total += rowTotal;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.id = `cart-row-${index}`;
        row.innerHTML = `
          <div class="cart-prod-info">
            <img src="${item.image}" alt="${item.title}" class="cart-prod-img">
            <div class="cart-prod-details">
              <h4>${item.title}</h4>
              <span>${item.variant}</span>
            </div>
          </div>
          <div class="cart-price">₹${(rowTotal).toLocaleString('en-IN')}</div>
          <div>
            <div class="cart-qty-picker">
              <button class="cart-qty-btn" onclick="EcommerceModule.changeQty(${index}, -1)">-</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn" onclick="EcommerceModule.changeQty(${index}, 1)">+</button>
            </div>
          </div>
          <div>
            <button class="cart-remove-btn" onclick="EcommerceModule.removeRow(${index})">REMOVE</button>
          </div>
        `;
        container.insertBefore(row, emptyMsg);
      });

      this.updateCartSummary(total);
    },

    changeQty(index, delta) {
      const cart = this.getCart();
      if (cart[index]) {
        cart[index].qty = Math.max(1, cart[index].qty + delta);
        this.saveCart(cart);
        this.renderCartPage();
      }
    },

    removeRow(index) {
      const cart = this.getCart();
      if (cart[index]) {
        cart.splice(index, 1);
        this.saveCart(cart);
        this.renderCartPage();
      }
    },

    updateCartSummary(total) {
      const formatted = '₹' + total.toLocaleString('en-IN');
      const subtotalEl = document.getElementById('subtotalDisplay');
      const totalEl = document.getElementById('totalDisplay');
      if (subtotalEl) subtotalEl.textContent = formatted;
      if (totalEl) totalEl.textContent = formatted;
    }
  };

  // Expose to window for inline onclick handlers
  window.EcommerceModule = EcommerceModule;

  // ==========================================
  // 4. REAL-TIME SAREE CATALOG FILTER MODULE
  // ==========================================
  const CatalogFilterModule = {
    init() {
      this.grid = document.querySelector('.catalog-grid');
      if (!this.grid) return;

      this.cards = Array.from(this.grid.querySelectorAll('.product-card'));
      this.priceRange = document.getElementById('priceRange');
      this.priceMaxLabel = document.getElementById('priceMaxLabel');
      this.searchInput = document.getElementById('sareeSearchInput');
      this.sortSelect = document.querySelector('.sort-select');
      this.resultCount = document.querySelector('.result-count');
      this.pricePill = document.querySelector('.pill-price');
      this.filterToggleBtn = document.getElementById('filterToggleBtn');
      this.sidebar = document.querySelector('.filter-sidebar');

      this.bindEvents();
      this.filterProducts();
    },

    bindEvents() {
      if (this.priceRange) {
        this.priceRange.addEventListener('input', () => {
          if (this.priceMaxLabel) {
            const val = parseInt(this.priceRange.value, 10);
            this.priceMaxLabel.textContent = '₹' + val.toLocaleString('en-IN');
          }
          if (this.pricePill) {
            const val = parseInt(this.priceRange.value, 10);
            this.pricePill.textContent = 'Price:₹' + (val / 1000).toFixed(0) + 'k';
          }
          this.filterProducts();
        });
      }

      const checkboxes = document.querySelectorAll('.filter-sidebar input[type="checkbox"]');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', () => this.filterProducts());
      });

      if (this.searchInput) {
        this.searchInput.addEventListener('input', () => this.filterProducts());
      }

      if (this.sortSelect) {
        this.sortSelect.addEventListener('change', () => this.sortProducts());
      }

      if (this.filterToggleBtn && this.sidebar) {
        this.filterToggleBtn.addEventListener('click', () => {
          this.sidebar.classList.toggle('is-open');
        });
      }
    },

    filterProducts() {
      const maxPrice = this.priceRange ? parseInt(this.priceRange.value, 10) : Infinity;
      const searchQuery = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';

      // Selected Categories
      const catCheckboxes = document.querySelectorAll('.filter-group-category input[type="checkbox"]:checked');
      const selectedCats = Array.from(catCheckboxes).map(cb => cb.value);

      // Selected Zari Types
      const zariCheckboxes = document.querySelectorAll('.filter-group-zari input[type="checkbox"]:checked');
      const selectedZaris = Array.from(zariCheckboxes).map(cb => cb.value);

      let visibleCount = 0;

      this.cards.forEach(card => {
        const price = parseInt(card.dataset.price, 10) || 0;
        const category = card.dataset.category || '';
        const zari = card.dataset.zari || '';
        const title = (card.dataset.title || card.querySelector('h4')?.textContent || '').toLowerCase();

        const matchPrice = price <= maxPrice;
        const matchCategory = !selectedCats.length || selectedCats.includes(category);
        const matchZari = !selectedZaris.length || selectedZaris.includes(zari);
        const matchSearch = !searchQuery || title.includes(searchQuery) || category.includes(searchQuery);

        if (matchPrice && matchCategory && matchZari && matchSearch) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (this.resultCount) {
        this.resultCount.textContent = `Showing ${visibleCount} Heirloom Silk${visibleCount === 1 ? '' : 's'}`;
      }

      this.sortProducts();
    },

    sortProducts() {
      if (!this.sortSelect) return;
      const sortValue = this.sortSelect.value;

      const visibleCards = this.cards.filter(c => c.style.display !== 'none');

      if (sortValue.includes('Low to High')) {
        visibleCards.sort((a, b) => parseInt(a.dataset.price, 10) - parseInt(b.dataset.price, 10));
      } else if (sortValue.includes('High to Low')) {
        visibleCards.sort((a, b) => parseInt(b.dataset.price, 10) - parseInt(a.dataset.price, 10));
      } else if (sortValue.includes('Newest')) {
        visibleCards.reverse();
      }

      visibleCards.forEach(card => this.grid.appendChild(card));
    }
  };

  // ==========================================
  // INITIALIZE ALL MODULES ON DOM CONTENT LOADED
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    HeaderModule.init();
    ScrollRevealModule.init();
    EcommerceModule.init();
    CatalogFilterModule.init();
  });

})();
