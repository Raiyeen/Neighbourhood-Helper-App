async function seed() {
  const posts = [
      { title: "Need a ladder", description: "I need a tall ladder to clean my gutters this weekend.", areaName: "Northside", accessories: "Ladder" },
      { title: "Lost dog seen", description: "Saw a golden retriever wandering near the park.", areaName: "West End", accessories: "" },
      { title: "Borrowing a drill", description: "Does anyone have a power drill I can borrow for an hour?", areaName: "Eastside", accessories: "Power Drill, Bits" }
  ]
  for (let p of posts) {
    await fetch('http://localhost:3000/api/posts', { method: 'POST', body: JSON.stringify(p), headers: { 'Content-Type': 'application/json' }})
  }
}
seed()
