// roomPost.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('roomPostForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const townshipInput = document.getElementById('township');
    const townshipOptions = document.getElementById('township-options');
    const formTitle = document.createElement('h2');
    formTitle.style.textAlign = 'center';
    form.insertBefore(formTitle, form.firstChild);
    
    // Check if we're editing an existing room
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const editingRoomId = localStorage.getItem('editingRoomId');
    
    // Township data
    const townships = [
        "Olievenhoutbosch", "Soweto", "Alexandra", "Tembisa", "Katlehong", "Vosloorus",
        "Mamelodi", "Atteridgeville", "Soshanguve", "Hammanskraal",
        "Khayelitsha", "Gugulethu", "Nyanga", "Langa", "Mitchells Plain",
        "Umlazi", "KwaMashu", "Inanda", "Ntuzuma", "Clermont"
    ];

    // Track which images are marked for deletion
    const imagesToDelete = [];
    let isImageDeletionInProgress = false;
    
    // Initialize form based on mode
    if (isEditMode && editingRoomId) {
        formTitle.textContent = 'Edit Your Room Post';
        submitBtn.textContent = 'Update Room';
        
        // Load the room data
        const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        const room = rooms.find(r => r.id === editingRoomId);
        
        if (room) {
            // Populate form fields
            document.getElementById('landlordName').value = room.landlordName;
            document.getElementById('contactNumber').value = room.contactNumber;
            townshipInput.value = room.township;
            document.getElementById('extension').value = room.extension;
            document.getElementById('rent').value = room.rent;
            document.getElementById('prepaidMeter').checked = room.features.prepaidMeter;
            document.getElementById('tiling').checked = room.features.tiling;
            document.getElementById('burglarDoor').checked = room.features.burglarDoor;
            document.getElementById('parkingSpace').value = room.features.parkingSpace.toString();
            document.getElementById('otherFeatures').value = room.features.other || '';
            document.getElementById('availability').value = room.availability;
            
            // Handle image previews with delete options
            if (room.images && room.images.length > 0) {
                for (let i = 0; i < Math.min(room.images.length, 3); i++) {
                    const previewId = `preview${i+1}`;
                    const inputId = `image${i+1}`;
                    const frame = document.querySelector(`.frame:nth-child(${i+1})`);
                    const preview = document.getElementById(previewId);
                    
                    // Create delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-image-btn';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.title = 'Delete this image';
                    deleteBtn.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        isImageDeletionInProgress = true;
                        imagesToDelete.push(i);
                        preview.style.display = 'none';
                        preview.src = '';
                        document.getElementById(inputId).value = '';
                        frame.querySelector('.add-img').style.display = 'block';
                        this.style.display = 'none';
                        isImageDeletionInProgress = false;
                        return false;
                    };
                    
                    // Add preview with delete button
                    preview.src = room.images[i];
                    preview.style.display = 'block';
                    preview.previousElementSibling.style.display = 'none';
                    frame.appendChild(deleteBtn);
                }
            }
        } else {
            alert('Room not found for editing');
            window.location.href = 'index.html';
        }
    } else {
        formTitle.textContent = 'Post a New Room';
    }
    
    // Image preview functionality
    const setupImagePreview = (inputId, previewId) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const frame = input.closest('.frame');
        
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Remove any existing delete button
                    const existingDeleteBtn = frame.querySelector('.delete-image-btn');
                    if (existingDeleteBtn) {
                        existingDeleteBtn.remove();
                    }
                    
                    // Create new delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-image-btn';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.title = 'Delete this image';
                    deleteBtn.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        input.value = '';
                        preview.style.display = 'none';
                        preview.src = '';
                        frame.querySelector('.add-img').style.display = 'block';
                        this.style.display = 'none';
                        return false;
                    };
                    
                    // Update preview
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    preview.previousElementSibling.style.display = 'none';
                    frame.appendChild(deleteBtn);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    };
    
    // Initialize image previews for all three image slots
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
    
    function generateEditCode(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
    // Form submission
    form.addEventListener('submit', function(e) {
        // Prevent form submission if we're just deleting images
        if (isImageDeletionInProgress) {
            e.preventDefault();
            return false;
        }

        e.preventDefault();
        
        // Disable submit button to prevent multiple submissions
        submitBtn.disabled = true;
        submitBtn.textContent = isEditMode ? 'Updating...' : 'Posting...';
        
        // Validate inputs
        if (!townships.includes(townshipInput.value.trim())) {
            alert('Please select a valid township from the list');
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Update Room' : 'Post Room';
            return;
        }
        
        const extension = parseInt(document.getElementById('extension').value);
        if (isNaN(extension) || extension < 1 || extension > 100) {
            alert('Please enter a valid extension number between 1 and 100');
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Update Room' : 'Post Room';
            return;
        }
        
        const rent = parseInt(document.getElementById('rent').value);
        if (isNaN(rent) || rent < 500) {
            alert('Please enter a valid rent amount (minimum R500)');
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Update Room' : 'Post Room';
            return;
        }
        
        const contactNumber = document.getElementById('contactNumber').value;
        if (!/^\d{10}$/.test(contactNumber)) {
            alert('Please enter a valid 10-digit contact number');
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Update Room' : 'Post Room';
            return;
        }
        
        // Create/update room object
        const roomId = isEditMode && editingRoomId ? editingRoomId : Date.now().toString();
        const room = {
            id: roomId,
            landlordName: document.getElementById('landlordName').value,
            contactNumber: contactNumber,
            township: townshipInput.value,
            extension: extension,
            rent: rent,
            features: {
                prepaidMeter: document.getElementById('prepaidMeter').checked,
                tiling: document.getElementById('tiling').checked,
                burglarDoor: document.getElementById('burglarDoor').checked,
                parkingSpace: document.getElementById('parkingSpace').value === 'true',
                other: document.getElementById('otherFeatures').value
            },
            availability: document.getElementById('availability').value,
            images: [],
            postedBy: 'current-user'
        };
        
        // Process images - handle deletions and new uploads
        if (isEditMode && editingRoomId) {
            const existingRoom = JSON.parse(localStorage.getItem('rooms')).find(r => r.id === editingRoomId);
            if (existingRoom && existingRoom.images) {
                // Keep images that aren't marked for deletion
                room.images = existingRoom.images.filter((img, index) => !imagesToDelete.includes(index));
            }
        }
        
        // Process newly uploaded images
        const imageInputs = ['image1', 'image2', 'image3'];
        let imagesProcessed = 0;
        const totalImages = imageInputs.filter(id => {
            const input = document.getElementById(id);
            return input.files && input.files[0];
        }).length;
        
        // Helper function to save and redirect
        const completeSubmission = () => {
            let rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
            
            if (isEditMode) {
                // Update existing room
                const index = rooms.findIndex(r => r.id === room.id);
                if (index !== -1) {
                    rooms[index] = room;
                }
            } else {
                // Add new room
                rooms.push(room);
            }
            
            localStorage.setItem('rooms', JSON.stringify(rooms));
            localStorage.setItem('lastPostedRoomId', room.id);
            
             if (!isEditMode) {
            const editCodes = JSON.parse(localStorage.getItem('editCodes') || '{}');
            const key = `${room.landlordName.toLowerCase()}_${room.contactNumber}`;
            if (!editCodes[key]) {
                const code = generateEditCode();
                editCodes[key] = code;
                localStorage.setItem('editCodes', JSON.stringify(editCodes));
            }
            }
            if (isEditMode) {
                localStorage.removeItem('editingRoomId');
                setTimeout(() => {
                    alert('Room updated successfully!');
                    window.location.href = `viewPosting.html?id=${room.id}`;
                }, 100);
            } else {
                window.location.href = `viewPosting.html?id=${room.id}`;
            }
           
        };
        
        
        if (totalImages === 0) {
            completeSubmission();
            return;
        }
        
        imageInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    room.images.push(e.target.result);
                    imagesProcessed++;
                    
                    if (imagesProcessed === totalImages) {
                        completeSubmission();
                    }
                };
                reader.readAsDataURL(input.files[0]);
            }
        });
    });
    
    // Initialize the form
    initializeTownshipOptions();
});

