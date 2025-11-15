function findPeerCardByEmail(email) {
    const cards = document.querySelectorAll('.peer-card');
    for (const c of cards) {
        if ((c.dataset.email || '').toLowerCase() === email.toLowerCase()) return c;
    }
    return null;
}

function generateDiceBearUrl(email = '') {
    const seed = encodeURIComponent((email || 'anonymous').toLowerCase());
    return `https://api.dicebear.com/8.x/bottts/svg?seed=${seed}&size=128`;
}

function parseDataList(value) {
    if (!value) return [];
    return [value.trim()].filter(Boolean);
}

function renderOfferSkillBadges(container, items) {
    container.innerHTML = '';
    items.forEach((item) => {
        const badge = document.createElement('span');
        badge.className = 'bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap';
        badge.textContent = item;
        container.appendChild(badge);
    });
}

function renderLearnSkillBadges(container, items) {
    container.innerHTML = '';
    items.forEach((item) => {
        const badge = document.createElement('span');
        badge.className = 'bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap';
        badge.textContent = item;
        container.appendChild(badge);
    });
}

function renderListItems(container, items) {
    container.innerHTML = '';
    items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        container.appendChild(li);
    });
}

function openProfileModal(card) {
    if (!card) return;

    const name = card.dataset.name || 'Anonymous';
    const email = card.dataset.email || '';
    const timezone = card.dataset.timezone || '';
    const availability = card.dataset.availability || '';
    const kudosCount = card.dataset.kudosCount || '0';
    const skillsOffer = parseDataList(card.dataset.skillsOffer || '');
    const skillsLearn = parseDataList(card.dataset.skillsLearn || '');
    const kudosReasons = parseDataList(card.dataset.kudosReasons || '');

    document.getElementById('profile-modal-name').textContent = name;
    document.getElementById('profile-modal-email').textContent = email ? `📧 ${email}` : '';
    document.getElementById('profile-modal-timezone').textContent = timezone ? `🕒 Timezone: ${timezone}` : '';
    document.getElementById('profile-modal-availability').textContent = availability ? `📅 Availability: ${availability}` : '';
    document.getElementById('profile-modal-kudos-count').textContent = kudosCount;
    document.getElementById('profile-modal-avatar').src = generateDiceBearUrl(email);
    document.getElementById('profile-modal-avatar').alt = `${name} Avatar`;

    const skillsOfferContainer = document.getElementById('profile-modal-skills-offer');
    const skillsLearnContainer = document.getElementById('profile-modal-skills-learn');
    const noSkillsOffer = document.getElementById('profile-modal-no-skills-offer');
    const noSkillsLearn = document.getElementById('profile-modal-no-skills-learn');

    renderOfferSkillBadges(skillsOfferContainer, skillsOffer);
    renderLearnSkillBadges(skillsLearnContainer, skillsLearn);

    if (skillsOffer.length === 0) {
        noSkillsOffer.classList.remove('hidden');
    } else {
        noSkillsOffer.classList.add('hidden');
    }

    if (skillsLearn.length === 0) {
        noSkillsLearn.classList.remove('hidden');
    } else {
        noSkillsLearn.classList.add('hidden');
    }

    const kudosReasonsContainer = document.getElementById('profile-modal-kudos-reasons');
    const noKudosReasons = document.getElementById('profile-modal-no-kudos-reasons');
    renderListItems(kudosReasonsContainer, kudosReasons);
    if (kudosReasons.length === 0) {
        noKudosReasons.classList.remove('hidden');
    } else {
        noKudosReasons.classList.add('hidden');
    }

    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        requestAnimationFrame(() => {
            const modalContent = document.getElementById('profile-modal-content');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        });
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    const modalContent = document.getElementById('profile-modal-content');
    if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    }
    modal.classList.remove('flex');
    modal.classList.add('hidden');
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
    const card = e.target.closest('.peer-card');
    if (card && !e.target.closest('.give-kudos-btn') && !e.target.closest('a')) {
        openProfileModal(card);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('kudos-form');
    const messageEl = document.getElementById('kudos-message');
    const profileModal = document.getElementById('profile-modal');

    document.querySelectorAll('.peer-card').forEach((card) => {
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openProfileModal(card);
            }
        });
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Open profile for ${card.dataset.name || 'peer'}`);
    });

    if (profileModal) {
        profileModal.addEventListener('click', (event) => {
            if (event.target === profileModal) {
                closeProfileModal();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && profileModal && !profileModal.classList.contains('hidden')) {
            closeProfileModal();
        }
    });

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


