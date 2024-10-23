const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const User = require("./Model/model");
const cors = require("cors");
const app = express();
const PORT = 5000;
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "AEZAKMI",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.post("/register", async (req, res) => {
  const { First_name, Surname, Dateofbirth, gender, password, Number_email } =
    req.body;
  const newUser = new User({
    First_name,
    Surname,
    Dateofbirth,
    gender,
    password,
    Number_email,
  });
  console.log(newUser);
  try {
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send("Error registering user: " + error.message);
  }
});
app.post("/login", async (req, res) => {
  const { Number_email, password } = req.body;

  const user = await User.findOne({ Number_email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).send("Invalid username or password");
  }
  req.session.userid = user._id.toString();
  req.session.save();
  res.status(200).send({ user: true });
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userid) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

// getting user
app.get("/user", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userid);
  res.json(user);
});

// Logout Route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }
    res.clearCookie("connect.sid", { path: "/", httpOnly: true });
    res.status(200).send("Logged out successfully");
  });
});
app.listen(PORT || process.env.PORT, () => {
  console.log("server is running");
});
