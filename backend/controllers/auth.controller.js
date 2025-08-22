// A temporary in-memory "database" for users
let fakeUsers = [];
let currentUserId = 1;

/**
 * Handles user registration (Sign Up).
 * Validates input, checks for existing users, and creates a new user.
 */
export const signup = (req, res) => {
  const { firstName, lastName, age, email, password } = req.body;

  // Basic validation
  if (!firstName || !email || !password) {
    return res.status(400).json({ message: "First name, email, and password are required." });
  }

  // Check if user already exists
  const userExists = fakeUsers.find(user => user.email === email);
  if (userExists) {
    return res.status(409).json({ message: "This email is already registered." });
  }

  // In a real app, you would hash the password here using bcrypt
  // const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: currentUserId++,
    firstName,
    lastName,
    age,
    email,
    password, // Storing plain text password ONLY for this mock setup
    createdAt: new Date().toISOString(),
  };

  fakeUsers.push(newUser);
  console.log("Current Users:", fakeUsers);

  // Respond with the new user's ID, as required by the HU
  res.status(201).json({ userId: newUser.id });
};

/**
 * Handles user authentication (Login).
 * Finds the user and validates their password.
 */
export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  // Find user in our fake database
  const user = fakeUsers.find(user => user.email === email);

  // In a real app, you would use bcrypt.compare() here
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  // In a real app, you would generate a JWT here
  const fakeJwtToken = `fake-jwt-for-user-${user.id}`;

  res.status(200).json({ token: fakeJwtToken });
};

// --- Placeholder functions for later sprints ---

export const logout = (req, res) => {
  res.status(200).json({ message: "Logout successful (placeholder)." });
};

export const recoverPassword = (req, res) => {
  res.status(200).json({ message: "Password recovery email sent (placeholder)." });
};