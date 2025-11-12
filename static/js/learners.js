function findPeerCardByEmail(email) {
    const cards = document.querySelectorAll('.peer-card');
    for (const c of cards) {
        if ((c.dataset.email || '').toLowerCase() === email.toLowerCase()) return c;
    }
    return null;
}

let currentReceiver = {};

function showKudosModal(name, email) {
    currentReceiver = { name, email };
    document.getElementById('kudos-modal-peer-name').textContent = `Recognizing: ${name || 'Anonymous'}`;
    document.getElementById('receiver-email-input').value = email || '';

    const messageEl = document.getElementById('kudos-message');
    messageEl.className = 'mt-4 p-3 rounded-lg text-sm font-semibold hidden';
    messageEl.textContent = '';

    const modal = document.getElementById('kudos-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeKudosModal() {
    const modal = document.getElementById('kudos-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.getElementById('kudos-form').reset();
}

// Filter peers based on search input
function filterPeers() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('.peer-card');

    cards.forEach(card => {
        const searchText = (card.dataset.search || '').toLowerCase();
        if (searchText.includes(filter)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.give-kudos-btn');
    if (btn) {
        showKudosModal(btn.dataset.name, btn.dataset.email);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('kudos-form');
    const messageEl = document.getElementById('kudos-message');

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const giverEmail = document.getElementById('giver-email').value.trim();
        const receiverEmail = document.getElementById('receiver-email-input').value.trim();

        messageEl.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
        messageEl.classList.add('mt-4', 'p-3', 'rounded-lg', 'text-sm', 'font-semibold');
        messageEl.textContent = 'Submitting...';

        try {
            const reason = document.getElementById('kudos-reason').value.trim();
            const res = await fetch('/api/give-kudos/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from_email: giverEmail,
                    to_email: receiverEmail,
                    reason: reason
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                messageEl.textContent = data.message || 'Kudos given successfully!';
                messageEl.classList.add('bg-green-100', 'text-green-800');

                const card = findPeerCardByEmail(receiverEmail);
                if (card) {
                    const countEl = card.querySelector('.kudos-count');
                    if (countEl) countEl.textContent = data.new_total ?? parseInt(countEl.textContent || '0') + 1;
                }

                setTimeout(closeKudosModal, 1200);
            } else {
                messageEl.textContent = data.error || 'Something went wrong, please try again.';
                messageEl.classList.add('bg-red-100', 'text-red-800');
            }
        } catch (err) {
            console.error('Error submitting kudos:', err);
            messageEl.textContent = 'Network or server error. Please try again.';
            messageEl.classList.add('bg-red-100', 'text-red-800');
        }
    });
});


