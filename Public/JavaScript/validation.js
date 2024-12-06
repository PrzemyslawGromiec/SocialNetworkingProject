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

function getAuthHeaders() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        return {};
    }
    return {
        Authorization: `Bearer ${token}`
    };
}

function toggleWrapperScale(sectionId) {
    const wrapper = document.querySelector('.wrapper');
    const newSection = document.getElementById(sectionId);

    if (newSection.classList.contains('feedScale')) {
        wrapper.classList.add('scaled');
    } else {
        wrapper.classList.remove('scaled');
    }
}

$(() => {

    function updateNavbarButtons() {
        const isLoggedIn = sessionStorage.getItem('authToken') && sessionStorage.getItem('userId');
        const logoutButton = document.getElementById('logoutButton');

        if (isLoggedIn) {
            logoutButton.style.display = 'block';
        } else {
            logoutButton.style.display = 'none';
        }
    }

    function showSection(sectionId) {
        const wrapper = document.querySelector('.wrapper');
        const activeSection = document.querySelector('.content-section.active');
        // const activeSection = document.querySelectorAll('.content-section.active');
        const newSection = document.getElementById(sectionId);

        if (newSection.id === 'feedSection') {
            wrapper.classList.add('scaled');
        } else {
            wrapper.classList.remove('scaled');
        }
    
        if (activeSection && activeSection !== newSection) {
            activeSection.classList.remove('active');
            activeSection.classList.add('hidden');
    
            // Wait for the transition to complete before removing the hidden class
            setTimeout(() => {
                activeSection.classList.remove('hidden');
            }, 50);
        }

        // activeSection.forEach(section => {
        //     if (section.id !== 'feedSection' && section.id !== 'userSearchModal') {
        //         console.log(section.id);
        //         section.classList.remove('active');
        //         section.classList.add('hidden');
        //         // Wait for the transition to complete before removing the hidden class
        //         setTimeout(() => {
        //             section.classList.remove('hidden');
        //         }, 50);
        //     }
        // })
    
        newSection.classList.add('active');
        toggleWrapperScale(sectionId);
    }

    function checkLoginStatus() {
        const authToken = sessionStorage.getItem('authToken');
        if (!authToken) {
            showSection('loginSection');
            return;
        }

        $.ajax({
            url: '/M00857241/login',
            method: 'GET',
            headers: { Authorization: `Bearer ${authToken}` },
            success: function (response) {
                console.log(response);
                if (response.loggedIn) {
                    console.log(`Logged in as ${response.username}`);
                } else {
                    console.log('User not logged in');
                    showSection('loginSection');
                }
            },
            error: function (error) {
                console.error('Error fetching login status:', error);
                showSection('loginSection');
            }
        });
    }

    updateNavbarButtons();
    checkLoginStatus();
    showSection('loginSection');

    $('#logoutButton').on('click', () => {
        const authToken = sessionStorage.getItem('authToken');
        console.log("Auth token being sent:", authToken);
        if (!authToken) {
            sessionStorage.clear(); 
            updateNavbarButtons();
            showSection('loginSection');
            // $('#feedSection').removeClass('active').addClass('hidden');
            return;
        }
    
        $.ajax({
            url: `/M00857241/login`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`
            },
            success: function () {
                sessionStorage.clear();
                updateNavbarButtons();
                showSection('loginSection');
                // $('#feedSection').removeClass('active').addClass('hidden');
                console.log('Logging out user');
            },
            error: function () {
                alert('Failed to log out. Please try again.');
            }
        });
    });

    // Switch between login and registration
    $('#switchToRegister').on('click',function () {
        showSection('registerSection');
    });


    $('#switchToLogin').on('click',function () {
        showSection('loginSection');
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
                updateNavbarButtons();
                showSection('feedSection');
                showSection('userSearchModal');
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
                sessionStorage.setItem('authToken', response.token);
                sessionStorage.setItem('userId', response.userId);
                console.log('Login successful:', response);
                $('#usernameDisplay').text(response.username);
                updateNavbarButtons();
                loadUserPosts(response.userId);
                showSection('feedSection');
            },
            error: function (xhr) {
                $('#loginError').text(xhr.responseJSON?.error || 'Login failed. Please try again.');
            }
        });
    });

    $('#createPostButton').on('click', function () {
        console.log('button clicked');
        $('#postModal').addClass('show');
        $('#modalOverlay').addClass('show');
    });

    $('#userFollowButton').on('click', function() {
        console.log('button clicked');
        $('#followModal').addClass('show');
        $('#modalOverlay').addClass('show');
    });
    
    $('.close').on('click', function () {
        $('#postModal').removeClass('show');
        $('#modalOverlay').removeClass('show');
    });

    $('.close').on('click', function () {
        $('#followModal').removeClass('show');
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
            data: JSON.stringify({content }),
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

    function loadUserPosts(userId) {
        $.ajax({
            url: `/M00857241/contents/${userId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
            success: function (response) {
                const feedContainer = $('#feed');
                feedContainer.empty();
                
                response.forEach(post => {
                    const formattedDate = new Date(post.createdAt).toLocaleString();
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