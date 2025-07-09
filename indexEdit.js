

document.addEventListener('DOMContentLoaded', function() {
    const editIcon = document.querySelector('.edit-img');
    
    editIcon.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check if there are any posted rooms
        const rooms = JSON.parse(localStorage.getItem('rooms') || []);
        if (rooms.length === 0) {
            alert('You have not posted any rooms yet.');
            return;
        }
        
        // Prompt for name and contact number
        const name = prompt('Please enter your name (as used when posting the room):');
        if (!name) return;
        
        const contactNumber = prompt('Please enter your contact number (as used when posting the room):');
        if (!contactNumber) return;
        
        // Find rooms posted by this user
        const userRooms = rooms.filter(room => 
            room.landlordName.toLowerCase() === name.toLowerCase() && 
            room.contactNumber === contactNumber
        );
        
        if (userRooms.length === 0) {
            alert('No rooms found with matching name and contact number.');
            return;
        }
        
        // If only one room, go straight to edit
        if (userRooms.length === 1) {
            localStorage.setItem('editingRoomId', userRooms[0].id);
            window.location.href = 'roomPost.html?edit=true';
            return;
        }
        
        // If multiple rooms, let user choose which to edit
        let message = 'You have multiple rooms posted. Please select which one to edit:\n\n';
        userRooms.forEach((room, index) => {
            message += `${index + 1}. ${room.township}, Extension ${room.extension} (R${room.rent}/month)\n`;
        });
        
        const choice = prompt(message + '\nEnter the number of the room you want to edit:');
        if (!choice || isNaN(choice)) return;
        
        const selectedIndex = parseInt(choice) - 1;
        if (selectedIndex >= 0 && selectedIndex < userRooms.length) {
            localStorage.setItem('editingRoomId', userRooms[selectedIndex].id);
            window.location.href = 'roomPost.html?edit=true';
        } else {
            alert('Invalid selection.');
        }
    });
});

// Example: Add a "Clear All Data" button in your HTML
document.getElementById('clearStorageBtn').addEventListener('click', function() {
    localStorage.clear();
    alert('All stored data has been cleared!');
});