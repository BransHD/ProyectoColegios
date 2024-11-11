const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const { create } = require('express-handlebars');



app.use(morgan('dev'));

const PORT = process.env.PORT || 4600;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.set('views', path.join(__dirname, 'views'));
const exphbs = create({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'main',
});
app.engine('.hbs', exphbs.engine);
app.set('view engine', '.hbs');

// Ruta principal
app.get('/', (req, res) => {
    res.render('layouts/main.hbs'); // Renderiza la vista 'home.hbs' usando 'main.hbs' como layout
});

app.use(express.static(path.join(__dirname, 'public')));
