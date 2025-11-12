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
    console.log('Resource Center loaded');
});


