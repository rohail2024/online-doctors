// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSxmdDMPW8uOoeExuauRpQtSkavJK2LWE",
  authDomain: "online-doctors-4u.firebaseapp.com",
  projectId: "online-doctors-4u",
  storageBucket: "online-doctors-4u.appspot.com",
  messagingSenderId: "479784655731",
  appId: "1:479784655731:web:f856fa82e896ff76c28306",
  measurementId: "G-BMBQ0BJVMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Emoji Picker
const picker = new EmojiButton();
const trigger = document.querySelector('.emoji-button');
picker.on('emoji', emoji => {
  document.querySelector('#messageInput').value += emoji;
});
trigger.addEventListener('click', () => picker.togglePicker(trigger));

// Check Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    displayMessages();
    document.getElementById('sendMessageButton').addEventListener('click', () => sendMessage(user));
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();  // Prevent default behavior
        sendMessage(user);
      }
    });
    document.getElementById('personaSelect').addEventListener('change', loadPersona);
    document.getElementById('logoutButton').addEventListener('click', () => signOut(auth).then(() => {
      window.location.href = "index.html";
    }));
    // Add user profile and settings
    displayUserProfile(user);
  } else {
    // No user is signed in
    window.location.href = "index.html";
  }
});

// Send Message
async function sendMessage(user) {
  const messageInput = document.getElementById('messageInput');
  const persona = document.getElementById('personaSelect').value;
  if (messageInput.value.trim() !== "") {
    await addDoc(collection(db, "messages"), {
      text: messageInput.value,
      uid: user.uid,
      timestamp: new Date(),
      displayName: user.displayName,
      persona: persona
    });
    messageInput.value = "";  // Clear input field after sending
  }
}

// Display Messages
function displayMessages() {
  const q = query(collection(db, "messages"), orderBy("timestamp"));
  const chatContainer = document.getElementById('chatContainer');
  onSnapshot(q, (snapshot) => {
    chatContainer.innerHTML = "";  // Clear existing messages
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.classList.add(message.uid === auth.currentUser.uid ? 'sent' : 'received');
      messageElement.innerHTML = `
        <div class="text">
          <strong>${message.displayName}:</strong> ${message.text} (Persona: ${message.persona})
        </div>
      `;
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;  // Scroll to bottom
    });
  });
}

// Load Persona
function loadPersona() {
  const persona = document.getElementById('personaSelect').value;
  // Load the corresponding persona logic here
}

// Display User Profile
function displayUserProfile(user) {
  document.getElementById('profileName').textContent = user.displayName;
  document.getElementById('profilePicture').src = user.photoURL || '';
}
