import express from 'express';
import { Pool } from 'pg';
import { encode } from './utils/base62';

const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'shortener',
    password: 'password',
    port: 5432,
});

// 1. SHORTEN ENDPOINT
app.post('/shorten', async (req, res) => {
    const { longUrl } = req.body;
    
    // Insert to get the unique ID
    const result = await pool.query(
        'INSERT INTO urls (long_url) VALUES ($1) RETURNING id',
        [longUrl]
    );
    
    const id = result.rows[0].id;
    const shortCode = encode(parseInt(id));

    // Update the row with its own short_code
    await pool.query(
        'UPDATE urls SET short_code = $1 WHERE id = $2',
        [shortCode, id]
    );

    res.json({ shortUrl: `http://localhost:3000/${shortCode}` });
});

// 2. REDIRECT ENDPOINT
// THE REDIRECT ROUTE
app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        console.log("Searching for shortCode:", shortCode);

        const result = await pool.query(
            'SELECT long_url FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (result.rows.length > 0) {
            const longUrl = result.rows[0].long_url;
            console.log("Redirecting to:", longUrl);
            return res.redirect(302, longUrl);
        }

        res.status(404).json({ error: "Short code not found" });
    } catch (err) {
        console.error("Redirect Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.listen(3000, () => console.log("Server running on port 3000"));