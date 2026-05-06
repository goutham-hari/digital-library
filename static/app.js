const API_URL = '/api/items';

// DOM Elements
const libraryGrid = document.getElementById('library-grid');
const addBtn = document.getElementById('add-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const addForm = document.getElementById('add-form');

// Event Listeners
addBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
});

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newItem = {
        title: document.getElementById('title').value,
        creator: document.getElementById('creator').value,
        type: document.getElementById('type').value,
        release_year: document.getElementById('year').value || null,
        rating: document.getElementById('rating').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            addForm.reset();
            modalOverlay.classList.add('hidden');
            fetchItems(); // Refresh list
        } else {
            console.error('Failed to add item');
            alert('Failed to add item to database. Please check console.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Could not connect to the server. Is the database running?');
    }
});

// Fetch and render items
async function fetchItems() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const items = await response.json();
        
        if (items.error) {
            libraryGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #ef4444;">Database Error: ${items.error}</div>`;
            return;
        }

        renderItems(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        libraryGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                Could not load items. Make sure your MySQL database is running and configured correctly in app.py.
            </div>
        `;
    }
}

function renderItems(items) {
    if (items.length === 0) {
        libraryGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                Your library is empty. Click "Add Item" to start your collection!
            </div>
        `;
        return;
    }

    libraryGrid.innerHTML = items.map(item => `
        <div class="item-card" data-id="${item.id}">
            <div class="item-badge">${item.type}</div>
            <h3 class="item-title">${escapeHTML(item.title)}</h3>
            <div class="item-creator">${escapeHTML(item.creator)}</div>
            <div class="item-meta">
                <span>${item.release_year || 'Unknown Year'}</span>
                <span>★ ${item.rating}/5</span>
            </div>
            <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
        </div>
    `).join('');
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchItems(); // Refresh list
        } else {
            console.error('Failed to delete item');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Utility to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Initial fetch
fetchItems();
