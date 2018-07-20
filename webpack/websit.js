let express = require('express');

let app = express();

app.use(express.static('dist'));

let server = app.listen(3000, function () {

  console.log('websit');
});
