const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home');
})

app.listen(PORT, () => {
  console.log(`LISTENING ON PORT ${PORT}`);
})