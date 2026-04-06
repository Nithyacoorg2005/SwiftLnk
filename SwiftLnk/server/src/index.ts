import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { isUri } from 'valid-url';
import { encode } from './utils/base62';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database & Cache Connections
const pool = new Pool({
    user: 'user', host: 'localhost', database: 'shortener', password: 'password', port: 5432,
});

const redisClient = createClient();
redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.connect().then(() => console.log("Redis Connected"));

// 2. SHORTEN ENDPOINT (With Transactions)
// 2. SHORTEN ENDPOINT (Updated for Custom Aliases)
app.post('/shorten', async (req: Request, res: Response) => {
    const { longUrl, alias } = req.body; // Capture optional alias

    if (!longUrl || !isUri(longUrl)) {
        return res.status(400).json({ error: "Invalid URL" });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let shortCode: string;

        if (alias) {
            // Path A: User provided a custom alias
            // Validate alias format (no spaces or special chars)
            if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
                return res.status(400).json({ error: "Alias must be alphanumeric" });
            }

            // Check if alias is already taken
            const check = await client.query('SELECT id FROM urls WHERE short_code = $1', [alias]);
            if (check.rows.length > 0) {
                return res.status(400).json({ error: "Alias already taken" });
            }

            shortCode = alias;
            await client.query(
                'INSERT INTO urls (long_url, short_code) VALUES ($1, $2)',
                [longUrl, shortCode]
            );
        } else {
            // Path B: Default Base62 generation
            const result = await client.query(
                'INSERT INTO urls (long_url) VALUES ($1) RETURNING id',
                [longUrl]
            );
            const id = Number(result.rows[0].id);
            shortCode = encode(id);

            await client.query(
                'UPDATE urls SET short_code = $1 WHERE id = $2',
                [shortCode, id]
            );
        }

        await client.query('COMMIT');

        // Cache the result (works for both alias and generated codes)
        await redisClient.set(shortCode, longUrl, { EX: 3600 }); 

        res.json({ shortUrl: `http://localhost:3000/${shortCode}`, shortCode });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    } finally {
        client.release();
    }
});

// 3. REDIRECT ENDPOINT (The Critical Path)
app.get('/:shortCode', async (req: Request, res: Response) => {
    const { shortCode } = req.params;

    try {
        // Cache Check
        const cachedUrl = await redisClient.get(shortCode);
        if (cachedUrl) {
            // Background Analytics (Don't await this)
            pool.query('UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1', [shortCode]);
            console.log("⚡ Cache Hit");
            return res.redirect(302, cachedUrl);
        }

        // DB Fallback
        const result = await pool.query(
            'SELECT long_url FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (result.rows.length > 0) {
            const longUrl = result.rows[0].long_url;
            await redisClient.set(shortCode, longUrl, { EX: 3600 });
            pool.query('UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1', [shortCode]);
            return res.redirect(302, longUrl);
        }

        res.status(404).send("<h1>404: Link not found</h1>");
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 4. ANALYTICS ENDPOINT
app.get('/api/stats/:shortCode', async (req: Request, res: Response) => {
    const { shortCode } = req.params;
    try {
        const result = await pool.query(
            'SELECT long_url, clicks, created_at FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Stats not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(3000, () => console.log("🚀 Server burning rubber on port 3000"));