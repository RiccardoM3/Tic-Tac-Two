const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// viewed at http://localhost:3000
app.get("/", function(req, res) {
  res.send("Tic Tac Toe");
});

app.listen(port, () => console.log(`Running app listening on port ${port}!`));