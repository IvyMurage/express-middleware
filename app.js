// 1. Write an Express route that handles a POST request to /login. In this route, extract the username and password from the request body and send a success or failure response.
// 2. Implement a GET route that responds with JSON data containing details of all users, and another GET route that responds with the details of a single user using URL parameters.
// 3. Set custom headers in the response of a route that handles file downloads in an Express application. Ensure the file type and size are specified.
// 4. Write an Express route that accepts a file upload via a POST request, saves the file to the server, and sends a response with the file location.

const express = require("express")
const crypto = require("crypto")
const fs = require("fs").promises
const app = express()

app.use(express.json())
const getUsers = async () => {
  const users = await fs.readFile("./users.json")
  return JSON.parse(users)
}

const addUsers = async users => {
  await fs.writeFile("./users.json", JSON.stringify(users))
}
app.use(async (req, res, next) => {
  const openRoutes = ["/login", "/signup"]
  if (openRoutes.includes(req.path)) return next()
  const token = req.headers["authorization"].split(" ")[1]

  if (!token) return res.status(401).send({ message: "Unauthorized, please provide valid token" })

  const users = await getUsers()

  const user = users.find(user => user.token === token)
  if (!user) return res.status(401).send({ message: "Unauthorized, please provide valid token" })

  next()
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const users = await getUsers()
    const user = users.find(user => user.username === username && user.password === password)
    if (!user)
      return res.status(404).send({
        message: "User not found",
      })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).send({
      message: error.message,
    })
  }

  // if (username === 'admin' && password === 'admin') res.send({
  //     message: 'Login successful'
  // })
  // else res.send({
  //     message: 'Login failed'
  // });
})

app.post("/signup", async (req, res) => {
  try {
    const users = await getUsers()
    const user = {
      token: crypto.randomBytes(64).toString("hex"),
      ...req.body,
    }
    users.push(user)
    await addUsers(users)
    res.status(200).send({
      message: "signed up successfully",
    })
  } catch (error) {
    res.status(500).send({
      message: error.message,
    })
  }
})

app.get("/", (req, res) => {
  res.redirect("/users")
})

app.get("/users", async (req, res) => {
  const users = await getUsers()
  res.status(200).json(users)
})

app.listen(3000, () => console.log("Server is running on port 3000"))
