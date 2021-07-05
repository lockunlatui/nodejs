const express = require('express');
const axios = require('axios');
const redis = require('redis');

const redisClient = redis.createClient(6379);

const app = express();
const PORT = process.env.PORT || 3000;

const MOCK_API = "https://jsonplaceholder.typicode.com/users/";

app.get("/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const response = await axios.get(`${MOCK_API}?email=${email}`);
    const user = response.data;
    console.log("user", user);
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/cache/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    redisClient.get(email, async (err, response) => {
      console.log("response", response)
      if(response) {
        console.log("User successfully retrieved from cache")
        res.status(200).send(JSON.parse(response));
      } else {
        const response = await axios.get(`${MOCK_API}?email=${email}`);
        const user = response.data;
        console.log("User successfully retrieved from the API");
      redisClient.setex(email,600, JSON.stringify(user))
      res.status(200).send(user);
      }
    })
  } catch (err) {
    res.status(500).send(err);
  }
})

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});