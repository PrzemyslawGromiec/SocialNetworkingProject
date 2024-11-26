function showErrorMessage(inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + 'Error');

    errorElement.textContent = message;
}

function clearErrorMessage(inputId) {
    const inputElement = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + 'Error');

    errorElement.textContent = '';
}

function validateRegistrationForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    let isValid = true;

    clearErrorMessage('username');
    clearErrorMessage('email');
    clearErrorMessage('password');

    if(!username || username.length < 3) {
        showErrorMessage('username', 'Min 3 characters long!');
        isValid = false;
    }

    if (!validateEmail(email)) {
        showErrorMessage('email', 'Invalid email format.');
        isValid = false;
    }

    if (password.length < 6) {
        showErrorMessage('password', 'Min 6 characters long.');
        isValid = false;
    }

    return isValid;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

$(() => {

    // function showSection(sectionId) {
    //     const wrapper = document.querySelector('.wrapper');
    //     const activeSection = document.querySelector('.content-section.active');
    //     const newSection = document.getElementById(sectionId);
    
    //     if (activeSection && activeSection !== newSection) {
    //         activeSection.classList.remove('active');
    //         activeSection.classList.add('hidden');
    
    //         // Wait for the transition to complete before removing the hidden class
    //         setTimeout(() => {
    //             activeSection.classList.remove('hidden');
    //         }, 500);
    //     }
    
    //     newSection.classList.add('active');
    
    //     // Adjust the wrapper height dynamically
    //     adjustWrapperHeight(sectionId);
    // }
    function showSection(sectionId, additionalHeight = 0) {
        const wrapper = document.querySelector('.wrapper');
        const activeSection = document.querySelector('.content-section.active');
        const newSection = document.getElementById(sectionId);
    
        if (activeSection && activeSection !== newSection) {
            activeSection.classList.remove('active');
            activeSection.classList.add('hidden');
    
            // Wait for the transition to complete before removing the hidden class
            setTimeout(() => {
                activeSection.classList.remove('hidden');
            }, 500);
        }
    
        newSection.classList.add('active');
    
        // Adjust the wrapper height dynamically
        adjustWrapperHeight(sectionId, additionalHeight);
    }

    // function adjustWrapperHeight(sectionId) {
    //     const wrapper = document.querySelector('.wrapper');
    //     const activeContent = document.getElementById(sectionId);
    
    //     // Measure the height of the active content
    //     const contentHeight = activeContent.scrollHeight;
    
    //     // Set the wrapper height to match the active content
    //     wrapper.style.height = `${contentHeight}px`;
    // }
    function adjustWrapperHeight(sectionId, additionalHeight = 0) {
        const wrapper = document.querySelector('.wrapper');
        const activeContent = document.getElementById(sectionId);
    
        // Measure the height of the active content
        const contentHeight = activeContent.scrollHeight;
    
        // Set the wrapper height to match the active content plus additionalHeight
        wrapper.style.height = `${contentHeight + additionalHeight}px`;
    }

    showSection('loginSection');

    // Switch between login and registration
    $('#switchToRegister').on('click',function () {
        showSection('registerSection',0);
    });


    $('#switchToLogin').on('click',function () {
        showSection('loginSection',0);
    });

    $('#username').on('blur input', function () {
        const username = $(this).val().trim();
        if (!username || username.length < 3) {
            showErrorMessage('username', 'Min 3 characters long.');
        } else {
            clearErrorMessage('username');
        }
    });

    // Live validation for email on blur
    $('#email').on('blur input', function () {
        const email = $(this).val().trim();
        if (!validateEmail(email)) {
            showErrorMessage('email', 'Invalid email format.');
        } else {
            clearErrorMessage('email');
        }
    });

    // Live validation for password on blur
    $('#password').on('blur input', function () {
        const password = $(this).val().trim();
        if (password.length < 6) {
            showErrorMessage('password', 'Min 6 characters long.');
        } else {
            clearErrorMessage('password');
        }
    });


    $('#registerSubmit').on('click', function () {
        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password').val().trim();

        if (validateRegistrationForm()) {

        // Send registration data to the server
        $.ajax({
            url: '/M00857241/users',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, email, password }),
            success: function (response) {
                sessionStorage.setItem('authToken', response.token); 
                sessionStorage.setItem('userId', response.userId);
                showSection('feedSection',20);
            },
            error: function (xhr) {
                $('#registrationError').text(xhr.responseJSON?.error || 'Registration failed. Please try again.');
            }
        });
    }
    });


    $('#loginSubmit').on('click',function () {
        const email = $('#loginEmail').val().trim();
        const password = $('#loginPassword').val().trim();

        // Validate fields
        if (!validateEmail(email)) {
            showErrorMessage('loginEmail', 'Invalid email format.');
            return;
        }
        if (password.length < 6) {
            showErrorMessage('loginPassword', 'Password must be at least 6 characters long.');
            return;
        }

        // Send login data to the server
        $.ajax({
            url: '/M00857241/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function (response) {
                sessionStorage.setItem('authToken', response.token); // Save token
                sessionStorage.setItem('userId', response.userId);
                $('#usernameDisplay').text(response.username); // Update username
                loadUserPosts(response.userId);
                showSection('feedSection');
            },
            error: function (xhr) {
                $('#loginError').text(xhr.responseJSON?.error || 'Login failed. Please try again.');
            }
        });
    });

    $('#createPostButton').on('click', function () {
        $('#postModal').addClass('show');
        $('#modalOverlay').addClass('show');
    });
    
    $('.close').on('click', function () {
        $('#postModal').removeClass('show');
        $('#modalOverlay').removeClass('show');
    });

    $('#modalOverlay').on('click', function () {
        $('#postModal').removeClass('show');
        $('#modalOverlay').removeClass('show');
    });


    $('#submitPost').on('click', function () {
        const content = $('#postContent').val().trim();
        const userId = sessionStorage.getItem('userId');
    
        if (!content) {
            return;
        }
    
        $.ajax({
            url: '/M00857241/contents',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({userId, content }),
            headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
            success: function (response) {
                const formattedDate = new Date().toLocaleString();
                $('#feed').prepend(`
                    <div class="post">
                        <p>${content}</p>
                        <small>Posted: ${formattedDate}</small>
                    </div>
                `);

            $('#postContent').val('');
        
            $('#postModal').removeClass('show');
            $('#modalOverlay').removeClass('show');
            
            },
            error: function (xhr) {
                alert(xhr.responseJSON?.error || "Failed to create post. Please try again.");
            }
        });
    });

    $('#feedSection').on('show', function () {
        loadFeed();
    });

    function loadUserPosts(userId) {
        $.ajax({
            url: `/M00857241/contents/${userId}`, // Endpoint do pobrania postów
            method: 'GET',
            headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` }, // Jeśli używasz tokenów
            success: function (response) {
                const feedContainer = $('#feed');
                feedContainer.empty(); // Wyczyść aktualne posty
                
                // Iteruj po liście postów i dodawaj je do feedu
                response.forEach(post => {
                    const formattedDate = new Date(post.createdAt).toLocaleString(); // Formatuj datę
                    feedContainer.append(`
                        <div class="post">
                            <p>${post.content}</p>
                            <small>Posted on ${formattedDate}</small>
                        </div>
                    `);
                });
            },
            error: function (xhr) {
                console.error('Failed to load posts:', xhr.responseJSON?.error || "Unknown error");
            }
        });
    }

});