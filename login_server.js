const express = require('express'); 
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const connection = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password: '#Include1',
    database: 'pyserves'
});

connection.connect((error) => { 
    if (error) {
        console.error('Error connecting to MySQL:', error);
    } else {
        console.log('MySQL Connected'); 
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(session({
    secret: 'your-password-#Include1',
    resave: false,
    saveUninitialized: true
}));

// Serve the login page
app.get('/', (req, res) => {
    res.render('login-page');
});

// Handle login form for basic user
app.post('/', (req, res) => {
    const { reg_useremail, reg_userpassword } = req.body;

    connection.query(
        'SELECT * FROM user_registration WHERE reg_useremail = ? AND reg_userpassword = ?',
        [reg_useremail, reg_userpassword],
        (error, result) => {
            if (error) {
                console.error('Error during query:', error);
                return res.send('Server error occurred.');
            }
            if (result.length > 0) {
                req.session.user = result[0]; // Store user info in the session
                res.redirect(`/personal-info`);
            } else {
                res.redirect('/login-page'); 
            }
        }
    );
});

// Serve the personal information page for basic user
app.get('/personal-info', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    const user = req.session.user;
    res.render('personal-info', { user });
});

// Serve the sign-up page
app.get('/sign-up', (req, res) => {
    res.render('sign-up');
});

// Handle sign-up form submission
app.post('/sign-up', (req, res) => {
    console.log(req.body);
    const {
        reg_firstname,
        reg_middlename,
        reg_lastname,
        gender,
        reg_useremail,
        reg_userpassword,
        reg_birthday,
        reg_bmonth,
        reg_byear,
        reg_validid_num,
        reg_idtype,
        reg_idcopy,
        reg_user_citizenship,
        reg_mobile_number,
        reg_skilledworker,
        reg_birthplace,
        reg_address
    } = req.body;

    const query = `
        INSERT INTO user_registration (
            reg_firstname,
            reg_middlename,
            reg_lastname,
            gender,
            reg_useremail,
            reg_userpassword,
            reg_birthday,
            reg_bmonth,
            reg_byear,
            reg_validid_num,
            reg_idtype,
            reg_idcopy,
            reg_user_citizenship,
            reg_mobile_number,
            reg_skilledworker,
            reg_birthplace,
            reg_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        reg_firstname,
        reg_middlename,
        reg_lastname,
        gender,
        reg_useremail,
        reg_userpassword,
        reg_birthday,
        reg_bmonth,
        reg_byear,
        reg_validid_num,
        reg_idtype,
        reg_idcopy,
        reg_user_citizenship,
        reg_mobile_number,
        reg_skilledworker,
        reg_birthplace,
        reg_address
    ], (err, result) => {
        if (err) {
            return res.status(500).send('Error saving user data');
        }
        res.redirect('/confirmation');
    });
});

// Serve the confirmation page
app.get('/confirmation', (req, res) => {
    res.render('confirmation');
});

// Serve the reservation page
app.get('/reservation', (req, res) => {
    const user = req.session.user;
    const query = `
    SELECT 
        registration_id,
        reg_firstname,
        reg_middlename,
        reg_lastname
    FROM 
        user_registration
    WHERE registration_id = ?`;

    connection.query(query, [user.registration_id], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving data from MySQL');
        }
        res.render('reservation', { user: results[0] });
    });
});
app.post('/reservation', (req, res) => {
    const user = req.session.user;  // Assuming the session holds the user information
    const registration_id = user.registration_id;  // Fetch the registration_id from the session
    
    const { fk_equipment_facility_id, reservation_start, reservation_end, reservation_purpose } = req.body;

    // Insert query that includes the foreign key from the session
    const insert = `INSERT INTO reservation (fk_equipment_facility_id, reservation_start, reservation_end, reservation_purpose, fk_reservation_registration_id) 
                    VALUES (?, ?, ?, ?, ?)`;

    connection.query(insert, [fk_equipment_facility_id, reservation_start, reservation_end, reservation_purpose, registration_id], (err, result) => {
        if (err) {
            console.error('Error inserting reservation data:', err);
            return res.status(500).send('Error processing the reservation.');
        }

        console.log('Reservation made successfully:', result);
        // Redirect to transaction page after successful reservation
        res.redirect('/transaction');
    });
});




/*app.get('/reservation_basketball_court', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Please log in to view this page');
    }
    const user = req.session.user;
    const query = `
    SELECT 
        registration_id,
        reg_firstname,
        reg_middlename,
        reg_lastname
    FROM 
        user_registration
    WHERE registration_id = ?`;

    connection.query(query, [user.registration_id], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving data from MySQL');
        }
        if (results.length > 0) {
            res.render('reservation_basketball_court', { user: results[0] });
        } else {
            res.status(404).send('User not found');
        }
    });
});
/*app.post('/reservation_basketball_court', (req, res) => {
    const user = req.session.user;

    if (!req.session.user) {
        return res.status(401).send('Please log in to make a reservation');
    }

   // const {reservation_start, reservation_end, reservation_purpose } = req.body;
   // const fk_reservation_registration_id = req.session.user.registration_id;
        const insertQuery = `
        INSERT INTO reservations (fk_reservation_registration_id, reservation_start, reservation_end, reservation_purpose)
        VALUES (?, ?, ?, ?);
        `;

        connection.query(insertQuery, [fk_reservation_registration_id, reservation_start, reservation_end, reservation_purpose], (err, result) => {
            if (err) {
                console.error('Error inserting reservation data into MySQL:', err.stack);
                return res.status(500).send('Error processing reservation');
            }

            console.log('Reservation successfully inserted:', result.insertId);
            res.redirect('/transaction');
    });
});*/
app.get('/transaction', (req, res) => {
    const user = req.session.user;  // Assuming user is logged in and you store user ID in the session

    // First query to get user information
    const userQuery = 'SELECT reg_firstname, reg_middlename, reg_lastname FROM user_registration WHERE registration_id = ?';
    
    // Query to retrieve reservation data and equipment name for the user
    const reservationQuery = `
        SELECT reservation.*, equipment_table.equipment_facility_name 
        FROM reservation 
        JOIN equipment_table
        ON reservation.fk_equipment_facility_id = equipment_table.equipment_facility_id 
        WHERE reservation.fk_reservation_registration_id = ? AND reservation.fk_equipment_facility_id = ?`;

    // Query for user information
    connection.query(userQuery, [user.registration_id], (err, userResults) => {
        if (err) {
            console.error("Error fetching user data:", err); // Log the actual error
            return res.status(500).send('Error retrieving user data from MySQL');
        }

        if (userResults.length === 0) {
            return res.status(404).send('User not found');
        } 

        // Now query for the user's reservations with equipment name
        connection.query(reservationQuery, [user.registration_id, 1001], (err, reservationResults) => { // Assuming 1001 is the facility ID you're filtering for
            if (err) {
                console.error("Error fetching reservation data:", err); // Log the actual error
                return res.status(500).send('Error retrieving reservations from MySQL');
            }

            // Render the transaction view with both user and reservation data
            res.render('transaction', {
                user: userResults[0],               // User information
                reservations: reservationResults    // Reservations data with equipment name
            });
        });
    });
});





//admin side!!! 
app.get('/admin_login_page', (req, res) => {
    res.render('admin_login_page');
})
app.post('/admin_login_page', (req, res) => {
    const { admin_useremail, admin_password } = req.body;

    connection.query(
        'SELECT * FROM admin_info_table WHERE admin_useremail = ? AND admin_password = ?',
        [admin_useremail, admin_password],
        (error, result) => {
            if (error) {
                console.error('Error during query:', error);
                return res.send('Server error occurred.');
            }
            if (result.length > 0) {
                req.session.user = result[0]; // Store user info in the session
                res.redirect(`/admin_personal_info`);
            } else {
                res.redirect('/admin_login-page'); 
            }
        }
    );
})

app.get('/admin_personal_info', (req, res)=>{
    if (!req.session.user) {
        return res.redirect('/admin_login_page');
    }
    const admin = req.session.user;
    res.render('admin_personal_info', {admin});
}) 
app.get('/admin_approve_request', (req,res )=>{
    res.render('admin_approve_request');
})
// Start the server
app.listen(5100, () => {
    console.log('Server started on http://localhost:5100'); 
});
