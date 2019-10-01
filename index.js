const express = require('express');
const app = express();
const port = 1337;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => res.render('pages/index'));
app.get('/manage', (req, res) => res.render('pages/manage'));
app.get('/login', (req, res) => res.render('pages/login'));



app.listen(port, () => console.log(`Project app listening on port ${port}!`));
