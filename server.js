// server.js

// Impor library yang dibutuhkan
const express = require('express');
const fs = require('fs');
const cors = require('cors');

// Inisialisasi aplikasi Express
const app = express();
const PORT = 3000; // Server akan berjalan di port 3000
const DB_FILE = './db.json'; // File untuk menyimpan data (database sederhana)

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Fungsi Bantuan untuk Database ---

// Fungsi untuk membaca data dari file db.json
const readDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ transactions: [] }));
    }
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

// Fungsi untuk menulis data ke file db.json
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Rute API (API Routes) ---

// [GET] /api/transactions - Mengambil semua transaksi
app.get('/api/transactions', (req, res) => {
    console.log('GET request received for all transactions');
    const db = readDB();
    res.json(db.transactions);
});

// [POST] /api/transactions - Menambahkan transaksi baru
app.post('/api/transactions', (req, res) => {
    const db = readDB();
    const newTransaction = req.body;
    newTransaction.id = Date.now(); 
    console.log('POST request received, adding:', newTransaction);
    db.transactions.push(newTransaction);
    writeDB(db);
    res.status(201).json(newTransaction);
});

// [PUT] /api/transactions/:id - Mengedit transaksi berdasarkan ID
app.put('/api/transactions/:id', (req, res) => {
    const db = readDB();
    const transactionId = parseInt(req.params.id, 10);
    const updatedData = req.body;
    console.log(`PUT request for transaction id: ${transactionId}`, updatedData);

    let transactionFound = false;
    db.transactions = db.transactions.map(t => {
        if (t.id === transactionId) {
            transactionFound = true;
            // Gabungkan data lama dengan data baru, pastikan ID tidak berubah
            return { ...t, ...updatedData, id: t.id };
        }
        return t;
    });

    if (transactionFound) {
        writeDB(db);
        const updatedTransaction = db.transactions.find(t => t.id === transactionId);
        res.json(updatedTransaction);
    } else {
        res.status(404).json({ message: 'Transaction not found' });
    }
});

// [DELETE] /api/transactions/:id - Menghapus satu transaksi berdasarkan ID
app.delete('/api/transactions/:id', (req, res) => {
    const db = readDB();
    const transactionId = parseInt(req.params.id, 10);
    console.log(`DELETE request for transaction id: ${transactionId}`);

    const initialLength = db.transactions.length;
    db.transactions = db.transactions.filter(t => t.id !== transactionId);

    if (db.transactions.length < initialLength) {
        writeDB(db);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Transaction not found' });
    }
});


// [DELETE] /api/transactions - Menghapus SEMUA transaksi
app.delete('/api/transactions', (req, res) => {
    console.log('DELETE request received, clearing all data');
    writeDB({ transactions: [] });
    res.status(204).send();
});

// --- Menjalankan Server ---
app.listen(PORT, () => {
    console.log(`Server KeuanganKu berjalan di http://localhost:${PORT}`);
    console.log('Menunggu permintaan dari frontend...');
});
