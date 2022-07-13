const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
//const expressHbs = require('express-handlebars')

const app = express();

// Handlebars setup
// app.engine('hbs', expressHbs.engine({
//     layoutsDir: 'views',
//     defaultLayout: 'layouts/main-layout',
//     extname: 'hbs'
// }))
// app.set('view engine', 'hbs');

// Pug setup
//app.set('view engine', 'pug');
// Ejs

app.set('view engine', 'ejs');
app.set('views', 'views')

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page not found' })
});

app.listen(3000);
