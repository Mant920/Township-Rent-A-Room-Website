document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (!roomId) {
        const lastPostedId = localStorage.getItem('lastPostedRoomId');
        if (lastPostedId) {
            window.location.href = `viewPosting.html?id=${lastPostedId}`;
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
    
    // Get the room details
    let rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    const room = rooms[roomIndex];
    
    if (!room) {
        document.getElementById('room-container').innerHTML = `
            <div class="error-message">
                <p>Room not found.</p>
                <button onclick="window.location.href='index.html'">Return to Home</button>
            </div>
        `;
        return;
    }
    
    // Display the room details with edit and delete options
    const roomContainer = document.getElementById('room-container');
    
    let imagesHTML = '';
    if (room.images && room.images.length > 0) {
        imagesHTML = room.images.map(img => 
            `<div class="room-image-container">
                <img src="${img}" alt="Room image" class="room-image">
            </div>`
        ).join('');
    } else {
        imagesHTML = `
            <div class="room-image-container">
                <div class="room-image no-image">No image</div>
            </div>
        `;
    }
    
    let featuresHTML = '<ul class="features-list">';
    if (room.features.prepaidMeter) featuresHTML += '<li>Prepaid Meter</li>';
    if (room.features.tiling) featuresHTML += '<li>Tiling</li>';
    if (room.features.burglarDoor) featuresHTML += '<li>Burglar Door</li>';
    if (room.features.parkingSpace) featuresHTML += '<li>Parking Space</li>';
    if (room.features.other) featuresHTML += `<li>${room.features.other}</li>`;
    featuresHTML += '</ul>';
    
    roomContainer.innerHTML = `
        <div class="posted-room-header">
            <h2>Your Posted Room</h2>
            <p class="success-message">Room posted successfully!</p>
        </div>
        
        <div class="room-images-container">
            ${imagesHTML}
        </div>
        
        <div class="room-details">
            <h3>${room.township}, Extension ${room.extension}</h3>
            <p class="rent">R${room.rent} per month</p>
            <p class="status">Status: ${room.availability}</p>
            <p class="contact">Landlord: ${room.landlordName}</p>
            
            <div class="features">
                <h4>Features:</h4>
                ${featuresHTML}
            </div>
            
            <div class="action-buttons">
                <button class="edit-btn" onclick="editRoom('${room.id}')">Edit Room</button>
                <button class="delete-btn" onclick="deleteRoom('${room.id}')">Delete Room</button>
                <button class="post-another-btn" onclick="window.location.href='roomPost.html'">Post Another Room</button>
                <button class="return-home-btn" onclick="window.location.href='index.html'">Return to Home</button>
            </div>
        </div>
    `;
});

// Edit room function
function editRoom(roomId) {
    localStorage.setItem('editingRoomId', roomId);
    window.location.href = 'roomPost.html?edit=true';
}

// Delete room function
function deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room posting?')) {
        let rooms = JSON.parse(localStorage.getItem('rooms') || []);
        rooms = rooms.filter(room => room.id !== roomId);
        localStorage.setItem('rooms', JSON.stringify(rooms));
        
        // If this was the last posted room, clear that reference
        if (localStorage.getItem('lastPostedRoomId') === roomId) {
            localStorage.removeItem('lastPostedRoomId');
        }
        
        alert('Room posting deleted successfully.');
        window.location.href = 'index.html';
    }
}
