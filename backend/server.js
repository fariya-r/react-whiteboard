const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Parse JSON string from Railway env var
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Fallback for local development
  serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const fs = require('fs');
const bodyParser = require('body-parser');

const http = require('http')
const { Server } = require("socket.io");

const createTeacherRoute = require('./routes/createTeacher');
const teacherRoutes = require('./routes/getTeachers');
const deleteTeacherRoute = require('./routes/deleteTeacher');
const fileRoutes = require('./routes/fileRoutes');

//cloudiary:
// const cloudinaryUploadRoute = require('./routes/cloudinaryUpload');

const app = express();



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
const whiteboardStates = {};

// ✅ Corrected server.js code
// ✅ Corrected server.js code
io.on('connection', (socket) => {

  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    
    // ✅ Check if the room state exists, if not, initialize it
    if (!whiteboardStates[roomName]) {
      whiteboardStates[roomName] = {
        textBoxes: [],
      };
    }
    
    // Now it's safe to emit the initial state
    socket.emit('initial-state', whiteboardStates[roomName]);
  });

  socket.on('drawing', (data) => {
    const { room } = data;
    socket.to(room).emit('drawing', data);

    if (data.action === 'finish' && data.image) {
      // ✅ Check if the room state exists before updating
      if (whiteboardStates[room]) {
          whiteboardStates[room].image = data.image;
      }
    }
  });

  socket.on('text-box-created', (data) => {
    const { room } = data;
    socket.to(room).emit('text-box-created', data);

    // ✅ This is the corrected section
    // Check if the room state exists before pushing the textbox
    if (whiteboardStates[room]) {
        whiteboardStates[room].textBoxes.push(data.textBox);
    }
  });

  socket.on('disconnect', () => {
  });
});

const uploadDir = path.join(__dirname, 'uploads');
const recordingsDir = path.join(__dirname, 'recordings');
const extractedTextRoutes = require('./routes/extractedText');
// ✅ Multer config must come BEFORE upload is used
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `recording-${timestamp}.webm`;
    cb(null, filename);
  },
});

const upload = multer({ storage }); // ✅ Now this is safe

// ✅ Ensure the recordings directory exists
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir);
}

// ✅ Middlewares
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', extractedTextRoutes); // The base path must match your frontend

// ✅ Serve static recordings and uploads
app.use('/recordings', express.static(recordingsDir));
app.use('/storage', express.static(uploadDir));
app.use(require('./routes/delete'));

// ✅ Mount custom routes
app.use('/api', fileRoutes);
app.use('/api/create-teacher', createTeacherRoute);
app.use('/api', teacherRoutes);
app.use('/api/teacher', deleteTeacherRoute);

//Cloudinary
// app.use('/api', cloudinaryUploadRoute);


app.post('/api/upload-recording', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `${BASE_URL}/recordings/${req.file.filename}`;
  res.json({ fileUrl });
});


// ✅ List recordings
app.get('/api/recordings', async (req, res) => {
  try {
    const files = await fs.promises.readdir(recordingsDir);
    const recordings = files.map(file => ({
      filename: file,
      createdAt: fs.statSync(path.join(recordingsDir, file)).mtime,
    }));
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read recordings.' });
  }
});


// Serve React build static files if exist
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}


const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT} (port ${PORT})`);
});

