const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const { create } = require('express-handlebars');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passportLocal = require('passport-local').Strategy;

// Middlewares de configuración antes de rutas y autenticación
app.use(morgan('dev'));  // Logger
app.use(express.urlencoded({ limit: '10mb', extended: false })); // Tamaño de petición
app.use(cookieParser('@clavesecreta1603*_cookie')); // Configuración de cookies

// Configuración de sesiones
app.use(session({
    secret: '@clavesecreta1603*_cookie',
    resave: false,
    saveUninitialized: false,
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de Passport con estrategia local
passport.use(new passportLocal(function (username, password, done) {
    console.log(username, password);
    if (username === 'admin' && password === 'admin') {
        return done(null, { id: 1, name: 'Brandon' });
    }
    return done(null, false);
}));

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id: id, name: 'Brandon' }));

// Configuración de vistas y Handlebars
app.set('views', path.join(__dirname, 'views'));
const exphbs = create({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'main',
});
app.engine('.hbs', exphbs.engine);
app.set('view engine', '.hbs');

// Ruta principal protegida
app.get('/', (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}, (req, res) => {
    res.render('layouts/main.hbs');
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de login
app.get('/login', (req, res) => {
    res.render('auth/login', { layout: false });
});

// Ruta para autenticación en login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',  // Redirección si la autenticación es exitosa
    failureRedirect: '/login',  // Redirección si falla
}));

// Iniciar el servidor en el puerto especificado
const PORT = process.env.PORT || 4600;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
