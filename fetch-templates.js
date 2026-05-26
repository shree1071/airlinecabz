const token = "EAAN9kWbFySgBRqxYJeNhzf45EZCZBFJkW58uYWR6mw4JioJTtEKLZCnyn0xq0qXlTxfJgUIoyFrIJJaWRh9p3UTZBedVc4tPTQGqMVqRF6ZBo2ZCqesB7ImHZCpYHC8cA0dgaS4ULpY1AVcYFTtVx6CVdbORQGS656CFyVDZColZBh1Ellp2NTBAe7pDYOXdcPZA8e0gfJDFUtgB3ZABHPlJFGhyRZAe1VRZCTMZBA1B0MQUM0NoSZASkPT4bkN0DyLv0EbTaFluPzOEKHRd86rwZAkHyymyQzMZD";
const phoneId = "1169752749545559";
const wabaId = "1978125122810634";

async function fetchAllTemplates() {
  console.log("📋 Fetching all templates for WABA:", wabaId);
  const res = await fetch(`https://graph.facebook.com/v19.0/${wabaId}/message_templates?limit=20`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.data) {
    console.log(`Found ${data.data.length} templates:\n`);
    data.data.forEach(t => {
      console.log(`  ✅ Name: "${t.name}" | Language: "${t.language}" | Status: ${t.status}`);
    });
  } else {
    console.log("Error:", JSON.stringify(data, null, 2));
  }
}

fetchAllTemplates();
