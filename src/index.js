const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const { create } = require('express-handlebars');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passportLocal = require('passport-local').Strategy;
const fs = require('fs');



// Middlewares de configuración antes de rutas y autenticación
app.use(morgan('dev'));  // Logger
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logfile.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));


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



// Multer para subir archivos
const multer = require('multer');

const documentsPath = path.join(__dirname, 'public', 'documents');
if (!fs.existsSync(documentsPath)) {
    fs.mkdirSync(documentsPath, { recursive: true });
}
const upload = multer({ dest: documentsPath });


//en upload.single, el nombre, define que debe recibir un archivo con el nombre de imagenPerfil
app.post('/images/single', upload.single('imagenPerfil'), (req, res) => {
    SaveImage(req.file);
    res.send('Imagen subida');
});

function SaveImage(file) {
    const newPath = documentsPath + '/' + file.originalname;
    fs.renameSync(file.path, newPath);
    return newPath;
}


app.post('/images/multi', upload.array('photos', 10), (req, res) => {
    req.files.map(SaveImage);
    res.send('Imagenes subidas');
});

/*
{
  fieldname: 'imagenPerfil',
  originalname: 'WhatsApp Image 2024-11-10 at 7.32.06 PM.jpeg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'C:\\Users\\brand\\Desktop\\ProyectoColegios\\src\\public\\documents',
  filename: 'c45bf1b19422794777b93c297a82b21a',
  path: 'C:\\Users\\brand\\Desktop\\ProyectoColegios\\src\\public\\documents\\c45bf1b19422794777b93c297a82b21a',
  size: 236458
}
*/