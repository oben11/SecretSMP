import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// get skins from usernames.txt
function getSkins() {
    const nameFilePath = path.join(process.cwd(), 'usernames.txt')
    try {
        const usernames = fs.readFileSync(nameFilePath, 'utf-8')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
        return usernames.map(username => `https://minotar.net/avatar/${username}`);
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
