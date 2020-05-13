const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); // for post form data
const session = require('express-session');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const path = require('path');
const methodOverride = require('method-override');

require('./config/passport')(passport);
require('./model/Story');
require('./model/User');

//load routes
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');
//load keys
const keys = require('./config/keys');
//handlebar helpers
const {
    truncate,
    stripTags,
    formateDate,
    select,
    editIcon

} = require('./helper/hbs');
//map global promise
mongoose.Promise = global.Promise;


//mongoose connect

mongoose.connect(keys.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('Connected database'))
    .catch(err => console.log(err));


const app = express();


//middleware for bodyparser
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(jsonParser);
app.use(urlencodedParser);

app.use(methodOverride('_method'));

app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags,
        formateDate: formateDate,
        select: select,
        editIcon: editIcon
    },
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars),

}));
app.set('view engine', 'handlebars');




//session and  cookie-parser middleware 
app.use(cookieParser('secret'));
app.use(session());

//passport middleware
app.use(passport.initialize());
app.use(passport.session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));



//set global varibles
app.use((req, res, next) => {
        res.locals.user = req.user || null;
        next();
    })
    //set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);

app.use('/', index);
app.use('/stories', stories);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port : ${port}`);
});