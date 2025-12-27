
const BASE_URL = 'http://localhost:3000';

async function testSecurity() {
    console.log('--- Starting Security Verification ---');

    // 1. Test Content-Type on API (Using a fake ID, just checking 415 or 401/404 vs 500)
    // We expect 415 or similar if we don't send Content-Type, OR if we do send it but wrong.
    // My middleware returns 415 if missing.

    try {
        console.log('Testing missing Content-Type on PUT...');
        const res = await fetch(`${BASE_URL}/api/posts/fake-id`, {
            method: 'PUT',
            body: JSON.stringify({ title: 'test' }),
            // No headers
        });
        console.log(`[Missing CT] Status: ${res.status} (Expected 415)`);
    } catch (e) {
        console.error('Error connecting:', e);
    }

    // 2. Test Origin validation
    try {
        console.log('Testing invalid Origin...');
        const res = await fetch(`${BASE_URL}/api/posts/fake-id`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://evil.com'
            },
            body: JSON.stringify({ title: 'test' }),
        });
        console.log(`[Invalid Origin] Status: ${res.status} (Expected 403)`);
    } catch (e) {
        console.error('Error connecting:', e);
    }

    // 3. Test Valid headers (should pass security check, but fail auth/404)
    try {
        console.log('Testing valid headers...');
        const res = await fetch(`${BASE_URL}/api/posts/fake-id`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Origin': BASE_URL
            },
            body: JSON.stringify({ title: 'test' }),
        });
        console.log(`[Valid Headers] Status: ${res.status} (Expected 401 or 404)`);
    } catch (e) {
        console.error('Error connecting:', e);
    }
}

testSecurity();
