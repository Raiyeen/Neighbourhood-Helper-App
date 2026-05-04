async function seed() {
  try {
    // Check if server is up
    const health = await fetch('http://localhost:3000/api/posts').catch(()=>null)
    if (!health) {
       console.log("Server not ready");
       return;
    }

    const auth1 = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Smith', email: 'alice@example.com', phone: '555-001', gender: 'Female', address: 'Downtown', profession: 'Doctor', password: '12341234!' })
    })
    
    // Some headers parsing for the cookie
    const cookiesRaw = auth1.headers.get('set-cookie') || auth1.headers.get('cookie') || "";
    let cookieString = "";
    if (Array.isArray(cookiesRaw)) { cookieString = cookiesRaw[0]; } 
    else { cookieString = cookiesRaw.split(';')[0]; }

    await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob Jones', email: 'bob@example.com', phone: '555-002', gender: 'Male', address: 'Suburbs', profession: 'Engineer', password: '12341234!' })
    })

    await fetch('http://localhost:3000/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookieString },
      body: JSON.stringify({ title: 'Need moving boxes', description: 'Moving heavy boxes. Need help!', areaName: 'Downtown', urgency: 'emergency', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80' })
    })

    console.log("API Seeding complete!")
  } catch(e) {
    console.error(e)
  }
}
seed()
