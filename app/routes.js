module.exports = function(app, passport, db, multer, ObjectId) {

// Image Upload Code =========================================================================
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
});
var upload = multer({storage: storage});


// normal routes ===============================================================

// show the home page (will also have our login links)
// // // // the particular will render the index.ejs page when the localhost or URL is typed in the web browser
app.get('/', function(req, res) {
    res.render('index.ejs'); // the index / url of the page
});

// PROFILE SECTION =========================
app.get('/profile', isLoggedIn, function(req, res) { // a get request to GET information to produce the profile page ENDPOINT AND CALLBACK FUNCTION
    let uId = ObjectId(req.session.passport.user// KEYWORD QUESTION: where andin which database can we find the collection of this peice of information) // this is the callback the renders the page AND goes to the database when the passport user is stored and grabs the OBJECT ID. THEN we define it as "let uID"
    db.collection('posts').find({'posterId': uId}).toArray((err, result) => { //goes to our database that has a collection named post. Within collection /
      // .find.... goes to the post collection and find posterId that match with the CURRENT uId. the posterId is supposed to link to the user
      if (err) return console.log(err) // if the information is not avaialable return an error
      res.render('profile.ejs', {
        user : req.user,
        posts: result // the results AKA the information now avaiable for us to maniuplate and play with in the profile.ejs
      })
    })
});

// FEED PAGE =========================
app.get('/feed', function(req, res) { // when the route /feed is called  the callback function will be fired
    db.collection('posts').find().toArray((err, result) => { // this goes to the collection of post and shows us EVERYSINGLE post in the database regardless of uId : objectID(esfgsg...)
      if (err) return console.log(err) // throws an error message if info not avaiable
      res.render('feed.ejs', {  // this will render the feed.ejs page
        user : req.user,
        posts: result // this inserts the information from the post collection to be printed on the feed.ejs page .... on the feed.ejs is when print and maniuplated
      })
    })
});

// INDIVIDUAL POST PAGE =========================
app.get('/post/:zebra', function(req, res) { //the get method awaits for a specfic post to be clicked on, when the post is clicked on
    let postId = ObjectId(req.params.zebra) // the zebra is the queryString in line 48 will be found within database for the zebra and postId
    console.log(postId); //
    db.collection('posts').find({_id: postId}).toArray((err, result) => { //  this goes to the collection of post and find the ONE SINGLE post with the same UNIQUE posterID
      if (err) return console.log(err)
      res.render('post.ejs', {
        posts: result // this renders the post array of : the ONE SINGLE caption,like,and image
      })
    })
});

//Create Post =========================================================================
app.post('/qpPost', upload.single('file-to-upload'), (req, res, next) => { // this post new information into the ? DATABASE ? which is to upload a picture
  let uId = ObjectId(req.session.passport.user) // we make sure the userId of the image is going to be saved along with it when added to the database
  db.collection('posts').save({posterId: uId, caption: req.body.caption, likes: 0, imgPath: 'images/uploads/' + req.file.filename}, (err, result) => { // WHERE IS GETTING THESE NUMBERS
// // this is reffering the the posts collection, when a file is upload in the profile.ejs there is a form with a method /qpPost on line 50
// when it does save a singular form into the database, the information its taken is as follows:
// // // (a) the current userId in sesstion (b) the body.caption of the form is saved (c) the file. path of whatever the particular file is, actually ends up being saved
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile') // redirect method can be applied once the sumbit button is hit
  })
});

// LOGOUT ==============================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
