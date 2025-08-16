document.addEventListener('DOMContentLoaded', function() {
    const editIcon = document.querySelector('.edit-img');
    
    editIcon.addEventListener('click', function(e) {
        e.preventDefault();
        
        const code = prompt('Enter your 10-character Edit Code to manage your rooms:');
        if (!code) return;

        const editCodes = JSON.parse(localStorage.getItem('editCodes') || '{}');
        const matchedKeys = Object.entries(editCodes).filter(([key, val]) => val === code);

        if (matchedKeys.length === 0) {
            alert('Invalid edit code.');
            return;
        }

        const rooms = JSON.parse(localStorage.getItem('rooms') || []);
        const userRooms = rooms.filter(room => {
            const key = `${room.landlordName.toLowerCase()}_${room.contactNumber}`;
            return matchedKeys.some(([k]) => k === key);
        });

        if (userRooms.length === 0) {
            alert('No rooms found for this edit code.');
            return;
        }

        if (userRooms.length === 1) {
            localStorage.setItem('editingRoomId', userRooms[0].id);
            window.location.href = 'roomPost.html?edit=true';
            return;
        }

        let message = 'You have multiple rooms. Choose one to edit:\n\n';
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
