import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CHANNELS_FILE = path.join(DATA_DIR, 'channels.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Add this near the top of your file, after the helper functions but before any routes
const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    try {
      // Decode email from token
      const email = Buffer.from(token, 'base64').toString();
      const data = await readJSON(USERS_FILE);
      const user = data.users.find(u => u.email === email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
  
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
  
// Helper functions
async function initializeDataFiles() {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Initialize users.json
    if (!await fileExists(USERS_FILE)) {
      await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
    }

    // Initialize channels.json
    if (!await fileExists(CHANNELS_FILE)) {
      await fs.writeFile(CHANNELS_FILE, JSON.stringify({
        channels: [
          { id: 1, name: "general" },
          { id: 2, name: "random" }
        ]
      }, null, 2));
    }

    // Initialize messages.json
    if (!await fileExists(MESSAGES_FILE)) {
      await fs.writeFile(MESSAGES_FILE, JSON.stringify({ messages: [] }, null, 2));
    }

    console.log('Data files initialized successfully');
  } catch (error) {
    console.error('Error initializing data files:', error);
    throw error;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    throw error;
  }
}

async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// Initialize data files before starting the server
await initializeDataFiles();

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const data = await readJSON(USERS_FILE);
    let user = data.users.find(u => u.email === email);
    
    if (!user) {
      // Create new user
      user = {
        id: data.users.length + 1,
        name: email.split('@')[0],
        email,
        photo: null
      };
      
      data.users.push(user);
      await writeJSON(USERS_FILE, data);
    }

    const token = Buffer.from(email).toString('base64');
    
    console.log('Login successful:', { token, user });
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const data = await readJSON(USERS_FILE);
    
    if (data.users.some(user => user.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = {
      id: data.users.length + 1,
      name,
      email,
      photo: null
    };

    data.users.push(newUser);
    await writeJSON(USERS_FILE, data);

    const token = Buffer.from(email).toString('base64');
    
    console.log('Registration successful:', { token, user: newUser });
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error during registration' });
  }
});

// Profile endpoints
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.id);
    res.json(req.user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
// Get user by ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
      const data = await readJSON(USERS_FILE);
      const user = data.users.find(u => u.id === parseInt(req.params.id));
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error reading user:', error);
      res.status(500).json({ error: 'Error reading user' });
    }
  });
  
app.put('/api/users/profile', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const data = await readJSON(USERS_FILE);
    const userIndex = data.users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    if (req.body.name) {
      data.users[userIndex].name = req.body.name;
    }
    
    if (req.file) {
      data.users[userIndex].photo = `/uploads/${req.file.filename}`;
    }

    await writeJSON(USERS_FILE, data);
    res.json(data.users[userIndex]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Messages endpoints
app.get('/api/messages/:channelId', authenticateToken, async (req, res) => {
  try {
    const data = await readJSON(MESSAGES_FILE);
    const channelMessages = data.messages.filter(
      m => m.channelId === parseInt(req.params.channelId)
    );
    res.json(channelMessages);
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({ error: 'Error reading messages' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { channelId, text } = req.body;
    if (!channelId || !text) {
      return res.status(400).json({ error: 'Channel ID and text are required' });
    }

    const data = await readJSON(MESSAGES_FILE);
    const newMessage = {
      id: data.messages.length + 1,
      channelId: parseInt(channelId),
      userId: req.user.id,
      text,
      timestamp: new Date().toISOString()
    };
    
    data.messages.push(newMessage);
    await writeJSON(MESSAGES_FILE, data);
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Error creating message' });
  }
});
// DM endpoints
app.get('/api/messages/dm/:userId', authenticateToken, async (req, res) => {
    try {
      const data = await readJSON(MESSAGES_FILE);
      const dmMessages = data.messages.filter(m => 
        m.isDM && (
          (m.senderId === req.user.id && m.receiverId === parseInt(req.params.userId)) || 
          (m.senderId === parseInt(req.params.userId) && m.receiverId === req.user.id)
        )
      );
      res.json(dmMessages);
    } catch (error) {
      console.error('Error reading DMs:', error);
      res.status(500).json({ error: 'Error reading DMs' });
    }
  });
app.post('/api/messages/dm', authenticateToken, async (req, res) => {
    try {
      const { receiverId, text } = req.body;
      if (!receiverId || !text) {
        return res.status(400).json({ error: 'Receiver ID and text are required' });
      }
  
      const data = await readJSON(MESSAGES_FILE);
      const newMessage = {
        id: data.messages.length + 1,
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        text,
        timestamp: new Date().toISOString(),
        isDM: true
      };
      
      data.messages.push(newMessage);
      await writeJSON(MESSAGES_FILE, data);
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error creating DM:', error);
      res.status(500).json({ error: 'Error creating DM' });
    }
  });
  
// Channels endpoints
app.get('/api/channels', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching channels for user:', req.user.id);
    const data = await readJSON(CHANNELS_FILE);
    console.log('Channels data:', data);
    res.json(data.channels);
  } catch (error) {
    console.error('Error reading channels:', error);
    res.status(500).json({ error: 'Error reading channels' });
  }
});

app.post('/api/channels', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const data = await readJSON(CHANNELS_FILE);
    const newChannel = {
      id: data.channels.length + 1,
      name,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    data.channels.push(newChannel);
    await writeJSON(CHANNELS_FILE, data);
    res.status(201).json(newChannel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Error creating channel' });
  }
});

// Get single channel
app.get('/api/channels/:id', authenticateToken, async (req, res) => {
  try {
    const data = await readJSON(CHANNELS_FILE);
    const channel = data.channels.find(c => c.id === parseInt(req.params.id));
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.json(channel);
  } catch (error) {
    console.error('Error reading channel:', error);
    res.status(500).json({ error: 'Error reading channel' });
  }
});

// Add this endpoint with the other routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const data = await readJSON(USERS_FILE);
    // Return only non-sensitive user data
    const safeUserData = data.users.map(user => ({
      id: user.id,
      username: user.name
    }));
    res.json(safeUserData);
  } catch (err) {
    console.error('Error reading users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = 2222;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
}); 