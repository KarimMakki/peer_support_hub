// Filter resources based on search input
function filterResources() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('.resource-card');

    cards.forEach(card => {
        const searchText = (card.dataset.search || '').toLowerCase();
        if (searchText.includes(filter)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-suggest-modal');
    const modal = document.getElementById('suggest-modal');
    const closeBtn = document.getElementById('close-suggest-modal');
    const cancelBtn = document.getElementById('cancel-suggest');
    const form = document.getElementById('suggest-form');
    const messageEl = document.getElementById('suggest-message');

    function openModal() {
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        messageEl.classList.add('hidden');
        messageEl.textContent = '';
        messageEl.className = 'mt-2 p-3 rounded-lg text-sm font-semibold hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        if (form) form.reset();
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('sr-title').value.trim();
            const author = document.getElementById('sr-author').value.trim();
            const link = document.getElementById('sr-link').value.trim();
            const description = document.getElementById('sr-description').value.trim();
            const language = document.getElementById('sr-language').value.trim();

            const payload = { title, author, description, link, language };

            try {
                const res = await fetch('/api/submit-resource/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    const errMsg = data.error || 'Failed to submit resource';
                    messageEl.textContent = errMsg;
                    messageEl.classList.remove('hidden');
                    messageEl.classList.remove('bg-green-100', 'text-green-700');
                    messageEl.classList.add('bg-red-100', 'text-red-700');
                    return;
                }
                messageEl.textContent = 'Resource submitted successfully for review.';
                messageEl.classList.remove('hidden');
                messageEl.classList.remove('bg-red-100', 'text-red-700');
                messageEl.classList.add('bg-green-100', 'text-green-700');
                setTimeout(closeModal, 1200);
            } catch (err) {
                messageEl.textContent = 'Network error. Please try again later.';
                messageEl.classList.remove('hidden');
                messageEl.classList.remove('bg-green-100', 'text-green-700');
                messageEl.classList.add('bg-red-100', 'text-red-700');
            }
        });
    }
});


