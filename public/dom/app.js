
document.addEventListener('DOMContentLoaded', function() {
    // Township data - can be expanded or fetched from an API
    const townships = [
        "Olievenhoutbosch", "Soweto", "Alexandra", "Tembisa", "Katlehong", "Vosloorus",
        "Mamelodi", "Atteridgeville", "Soshanguve", "Hammanskraal",
        "Khayelitsha", "Gugulethu", "Nyanga", "Langa", "Mitchells Plain",
        "Umlazi", "KwaMashu", "Inanda", "Ntuzuma", "Clermont"
    ];

    
    // DOM Elements
    const townshipInput = document.getElementById('township-input');
    const townshipOptions = document.getElementById('township-options');
    const townshipError = document.getElementById('township-error');
    const priceRangeSelect = document.getElementById('priceRange');
    const extensionInput = document.getElementById('extension');
    const searchButton = document.querySelector('.userSearch');
    const autocompleteResults = document.getElementById('autocomplete-results');
    const prepaidMeterCheckbox = document.getElementById('prepaidMeter');
    const tilingCheckbox = document.getElementById('tiling');
    const bDoorCheckbox = document.getElementById('bDoor');
    const parkingSpaceCheckbox = document.getElementById('parkingSpace');
    const otherInput = document.getElementById('other');

    // Initialize township datalist
    function initializeTownshipOptions() {
        townshipOptions.innerHTML = '';
        townships.forEach(township => {
            const option = document.createElement('option');
            option.value = township;
            townshipOptions.appendChild(option);
        });
    }

    // Validate township input
    function validateTownship() {
        const value = townshipInput.value.trim();
        if (!value) {
            townshipError.textContent = 'Please select a township';
            return false;
        }
        if (!townships.includes(value)) {
            townshipError.textContent = 'Please select a valid township from the list';
            return false;
        }
        townshipError.textContent = '';
        return true;
    }

    // Validate extension input
    function validateExtension() {
        const value = extensionInput.value.trim();
        if (!value) {
            extensionInput.setCustomValidity('Please enter an extension number');
            return false;
        }
        if (value < 1 || value > 100) {
            extensionInput.setCustomValidity('Extension must be between 1 and 100');
            return false;
        }
        extensionInput.setCustomValidity('');
        return true;
    }

    // Handle form submission
    function handleSearch(event) {
    event.preventDefault();
    
    const isTownshipValid = validateTownship();
    const isExtensionValid = validateExtension();
    
    if (isTownshipValid && isExtensionValid) {
        const searchParams = new URLSearchParams();
        searchParams.append('township', townshipInput.value.trim());
        searchParams.append('priceRange', priceRangeSelect.value);
        searchParams.append('extension', extensionInput.value.trim());
        
        // Add features to search parameters
        if (prepaidMeterCheckbox.checked) searchParams.append('prepaidMeter', 'true');
        if (tilingCheckbox.checked) searchParams.append('tiling', 'true');
        if (bDoorCheckbox.checked) searchParams.append('burglarDoor', 'true');
        if (parkingSpaceCheckbox.checked) searchParams.append('parkingSpace', 'true');
        if (otherInput.value.trim()) searchParams.append('other', otherInput.value.trim());
        
        // Store in sessionStorage for results page
        sessionStorage.setItem('searchParams', searchParams.toString());
        
        // Navigate to results page
        window.location.href = `searchResults.html?${searchParams.toString()}`;
    }
}
    // Autocomplete for townships
    function showAutocomplete() {
        const inputValue = townshipInput.value.toLowerCase();
        autocompleteResults.innerHTML = '';
        
        if (inputValue.length < 2 || townships.includes(townshipInput.value.trim())) {
            autocompleteResults.style.display = 'none';
            return;
        }
        
        const filtered = townships.filter(township => 
            township.toLowerCase().includes(inputValue) && 
            township !== townshipInput.value.trim()
        );
        
        if (filtered.length > 0) {
            filtered.forEach(township => {
                const div = document.createElement('div');
                div.textContent = township;
                div.classList.add('autocomplete-item');
                div.addEventListener('click', () => {
                    townshipInput.value = township;
                    autocompleteResults.style.display = 'none';
                    validateTownship();
                });
                autocompleteResults.appendChild(div);
            });
            autocompleteResults.style.display = 'block';
        } else {
            autocompleteResults.style.display = 'none';
        }
    }

    // Event Listeners
    townshipInput.addEventListener('input', function() {
        showAutocomplete();
        validateTownship();
    });

    townshipInput.addEventListener('blur', function() {
        setTimeout(() => {
            autocompleteResults.style.display = 'none';
        }, 200);
    });

    extensionInput.addEventListener('input', validateExtension);
    extensionInput.addEventListener('blur', validateExtension);

    document.addEventListener('click', function(e) {
        if (e.target !== townshipInput && !autocompleteResults.contains(e.target)) {
            autocompleteResults.style.display = 'none';
        }
    });

    searchButton.addEventListener('click', handleSearch);

    // Initialize the form
    initializeTownshipOptions();
});

// roomPost.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('roomPostForm');
    const townshipInput = document.getElementById('township');
    const townshipOptions = document.getElementById('township-options');
    
    // Township data - same as in app.js
    const townships = [
        "Olievenhoutbosch", "Soweto", "Alexandra", "Tembisa", "Katlehong", "Vosloorus",
        "Mamelodi", "Atteridgeville", "Soshanguve", "Hammanskraal",
        "Khayelitsha", "Gugulethu", "Nyanga", "Langa", "Mitchells Plain",
        "Umlazi", "KwaMashu", "Inanda", "Ntuzuma", "Clermont"
    ];

    // Image preview functionality
    const setupImagePreview = (inputId, previewId) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    preview.previousElementSibling.style.display = 'none';
                }
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    };
    
    setupImagePreview('image1', 'preview1');
    setupImagePreview('image2', 'preview2');
    setupImagePreview('image3', 'preview3');
    
    // Initialize township datalist
    function initializeTownshipOptions() {
        townshipOptions.innerHTML = '';
        townships.forEach(township => {
            const option = document.createElement('option');
            option.value = township;
            townshipOptions.appendChild(option);
        });
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate inputs
        if (!townships.includes(townshipInput.value.trim())) {
            alert('Please select a valid township from the list');
            return;
        }
        
        const extension = parseInt(document.getElementById('extension').value);
        if (isNaN(extension)) {
            alert('Please enter a valid extension number');
            return;
        }
        
        // Create room object
        const room = {
            landlordName: document.getElementById('landlordName').value,
            contactNumber: document.getElementById('contactNumber').value,
            township: townshipInput.value,
            extension: extension,
            rent: parseInt(document.getElementById('rent').value),
            features: {
                prepaidMeter: document.getElementById('prepaidMeter').checked,
                tiling: document.getElementById('tiling').checked,
                burglarDoor: document.getElementById('burglarDoor').checked,
                parkingSpace: document.getElementById('parkingSpace').value === 'true',
                other: document.getElementById('otherFeatures').value
            },
            availability: document.getElementById('availability').value,
            images: []
        };
        
        // Get images
        const imageInputs = ['image1', 'image2', 'image3'];
        imageInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input.files && input.files[0]) {
                room.images.push(input.files[0].name); // Store just the filename
            }
        });
        
        // Store room in localStorage
        let rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        rooms.push(room);
        localStorage.setItem('rooms', JSON.stringify(rooms));
        
        alert('Room posted successfully!');
        form.reset();
        
        // Reset image previews
        document.querySelectorAll('.preview-img').forEach(img => {
            img.style.display = 'none';
            img.previousElementSibling.style.display = 'block';
        });
    });
    
    // Initialize the form
    initializeTownshipOptions();
});

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
            if (params.get('other') && !room.features.other.includes(params.get('other'))) return false;
            
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
                    `<img src="images/placeholder.jpg" alt="Room image" class="room-image">`
                ).join('');
            } else {
                imagesHTML = '<img src="images/placeholder.jpg" alt="Room image" class="room-image">';
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
                    <p>Contact: ${room.landlordName} (${room.contactNumber})</p>
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

