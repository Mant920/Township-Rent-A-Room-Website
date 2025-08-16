// searchResults.js
document.addEventListener('DOMContentLoaded', function() {
    const roomsList = document.getElementById('rooms-list');
    
    // Get search parameters from URL or sessionStorage
    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.toString() === '') {
        const savedParams = sessionStorage.getItem('searchParams');
        if (savedParams) {
            searchParams = new URLSearchParams(savedParams);
        }
    }
    
    // Get rooms from localStorage
    function getRooms() {
        return JSON.parse(localStorage.getItem('rooms') || []);
    }
    
    // Filter rooms based on search criteria
    function filterRooms(rooms, params) {
        return rooms.filter(room => {
            // Filter by township if specified
            if (params.get('township') && room.township !== params.get('township')) {
                return false;
            }
            
            // Filter by extension if specified
            if (params.get('extension') && room.extension.toString() !== params.get('extension')) {
                return false;
            }
            
            // Filter by price range if specified
            const priceRange = params.get('priceRange');
            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                if (max) {
                    if (room.rent < min || room.rent > max) return false;
                } else if (priceRange.endsWith('+')) {
                    const minPrice = parseInt(priceRange);
                    if (room.rent < minPrice) return false;
                }
            }
            
            // Filter by features if specified
            if (params.get('prepaidMeter') === 'true' && !room.features.prepaidMeter) return false;
            if (params.get('tiling') === 'true' && !room.features.tiling) return false;
            if (params.get('burglarDoor') === 'true' && !room.features.burglarDoor) return false;
            if (params.get('parkingSpace') === 'true' && !room.features.parkingSpace) return false;
            if (params.get('other') && (!room.features.other || !room.features.other.includes(params.get('other')))) return false;
            
            // Only show available rooms
            if (room.availability !== 'available') return false;
            
            return true;
        });
    }
    
    // Display rooms
    function displayRooms(rooms) {
        if (rooms.length === 0) {
            roomsList.innerHTML = '<p>No rooms found matching your criteria.</p>';
            return;
        }
        
        roomsList.innerHTML = '';
        
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            let imagesHTML = '';
            if (room.images && room.images.length > 0) {
                imagesHTML = room.images.map(img => 
                    `<img src="${img}" alt="Room image" class="room-image">`
                ).join('');
            } else {
                imagesHTML = '<div class="room-image no-image">No image</div>';
            }
            
            let featuresHTML = '<ul class="features-list">';
            if (room.features.prepaidMeter) featuresHTML += '<li>Prepaid Meter</li>';
            if (room.features.tiling) featuresHTML += '<li>Tiling</li>';
            if (room.features.burglarDoor) featuresHTML += '<li>Burglar Door</li>';
            if (room.features.parkingSpace) featuresHTML += '<li>Parking Space</li>';
            if (room.features.other) featuresHTML += `<li>${room.features.other}</li>`;
            featuresHTML += '</ul>';
            
            roomCard.innerHTML = `
                <div class="room-images">${imagesHTML}</div>
                <div class="room-details">
                    <h3>${room.township}, Extension ${room.extension}</h3>
                    <p class="rent">R${room.rent} per month</p>
                    ${featuresHTML}
                    <button class="contact-btn" data-contact="${room.contactNumber}">Contact Landlord</button>
                </div>
            `;
            
            roomsList.appendChild(roomCard);
        });
        
        // Add event listeners to contact buttons
        document.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const contactNumber = this.getAttribute('data-contact');
                if (confirm(`Call landlord at ${contactNumber}?`)) {
                    window.location.href = `tel:${contactNumber}`;
                }
            });
        });
    }
    
    // Initialize the page
    const allRooms = getRooms();
    const filteredRooms = filterRooms(allRooms, searchParams);
    displayRooms(filteredRooms);
});

