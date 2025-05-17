import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url); // url of current module -> converts url to filepath
const __dirname = path.dirname(__filename);        // get local directory portion

// serve html and js
app.use(express.static(path.join(__dirname, 'public')));

// get skins from usernames.txt
function getSkins() {
    const nameFilePath = path.join(process.cwd(), 'usernames.txt')
    try {
        const usernames = fs.readFileSync(nameFilePath, 'utf-8')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
        return usernames.map(username => `https://minotar.net/skin/${username}`);
    } catch (error) {
        console.error('Error reading usernames.txt:', error); 
        return [];
    }
}

app.get('/api/skins', (req, res) => {
    const skins = getSkins();
    res.json(skins)
});

app.use(express.static('public'));

app.listen(PORT, () =>  {
    console.log(`server running @ http://localhost:${PORT}`);
});
