// src/pocketbaseService.ts
import PocketBase from 'pocketbase';

// Initialize the PocketBase client with your local server URL
const client = new PocketBase('http://127.0.0.1:8090');

export default client;