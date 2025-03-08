import express from "express";

const app = express();


app.use(express.json());
app.use(express.urlencoded())

app.get('/', (req, res) => {
  res.send('Server is running...');
});


const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
