const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();

const buildPath = path.join(__dirname, '../PortfolioBuild');

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware to serve .gz files with proper headers
app.use((req, res, next) => {
    if (req.url.endsWith('.gz')) {
        const filePath = path.join(buildPath, req.url.slice(1));
        
        if (!fs.existsSync(filePath)) {
            console.log('File not found:', filePath);
            return res.status(404).send('File not found');
        }

        let contentType = 'application/octet-stream';
        if (filePath.endsWith('.js.gz')) contentType = 'application/javascript';
        else if (filePath.endsWith('.wasm.gz')) contentType = 'application/wasm';
        else if (filePath.endsWith('.data.gz')) contentType = 'application/octet-stream';

        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Type', contentType);
        
        console.log(`Serving ${req.url} as ${contentType}`);
        return fs.createReadStream(filePath).pipe(res);
    }
    next();
});

app.use(express.static(buildPath));

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    console.log('\nAvailable network interfaces:');
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4') {
                console.log(`  ${name}: ${iface.address} ${iface.internal ? '(internal)' : ''}`);
            }
        }
    }
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return 'localhost';
}

const PORT = 8000;
const localIp = getLocalIp();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`========================================`);
    console.log(`Desktop: http://localhost:${PORT}`);
    console.log(`Mobile:  http://${localIp}:${PORT}`);
    console.log(`========================================\n`);
});