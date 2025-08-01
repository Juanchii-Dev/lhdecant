const jwt = require('jsonwebtoken');

// JWT Secret del backend
const JWT_SECRET = process.env.JWT_SECRET || 'lhdecant-jwt-secret-2024';

// Token de ejemplo del frontend (extraído de los logs)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InkzeGx3ZFNXclB5TFZVU2twUXpOIiwiZW1haWwiOiJlc3RlYmFuZm9yZXgxMEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImVzdGViYW5mb3JleDEwQGdtYWlsLmNvbSIsImlhdCI6MTc1NDA3MzQyNSwiZXhwIjoxNzU0MTU5ODI1fQ._JxvDzVs4bnDVmU1pmh5_zsrNfKOlEu5lnSp7cjrsOc';

console.log('🔍 Probando verificación de JWT...');
console.log('🔑 JWT_SECRET:', JWT_SECRET);
console.log('🎫 Token de prueba:', testToken.substring(0, 50) + '...');

try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ JWT válido!');
    console.log('📋 Payload:', decoded);
} catch (error) {
    console.log('❌ JWT inválido:', error.message);
    console.log('🔍 Detalles del error:', error);
}

// Probar con un token generado localmente
const testUser = {
    id: 'test-123',
    email: 'test@example.com',
    username: 'test@example.com'
};

const localToken = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
console.log('\n🔑 Token generado localmente:', localToken.substring(0, 50) + '...');

try {
    const decodedLocal = jwt.verify(localToken, JWT_SECRET);
    console.log('✅ Token local válido!');
    console.log('📋 Payload:', decodedLocal);
} catch (error) {
    console.log('❌ Token local inválido:', error.message);
} 