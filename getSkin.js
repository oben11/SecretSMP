// Importing modules for Node.js environment
import fs from 'fs';
import path from 'path';

const usernamesFilePath = path.join(process.cwd(), 'usernames.txt');
let skins = [];

function getSkins() {
    try {
        const usernames = fs.readFileSync(usernamesFilePath, 'utf-8').split('\n').map(line => line.trim()).filter(line => line);
        return usernames.map(username => `https://minotar.net/skin/${username}`);
    } catch (error) {
        console.error('Error reading usernames.txt:', error); 
        return [];
    }
}

skins = getSkins();