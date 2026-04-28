const { createClient } = require('@insforge/sdk');

const insforge = createClient({
  baseUrl: 'https://m6ys432n.us-east.insforge.app',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzMzNjZ9.MsfiuguCgDkrKbEJvTJ-8fbxM79Aop8AyJao8vJW28Y'
});

async function updateImages() {
  // First, check current values
  console.log('Checking current Force Urbania entries...');
  const { data: current, error: checkError } = await insforge.database
    .from('vehicle_types')
    .select('slug, name, image_url')
    .like('slug', '%force-urbania%')
    .order('slug');
  
  if (checkError) {
    console.error('Error checking:', checkError);
    return;
  }
  
  console.log('Current entries:', JSON.stringify(current, null, 2));
  
  // Update both entries
  console.log('\nUpdating Force Urbania (Airport)...');
  const { data: data1, error: error1 } = await insforge.database
    .from('vehicle_types')
    .update({ image_url: '/force-urbania-v2.png' })
    .eq('slug', 'force-urbania')
    .select();
  
  if (error1) {
    console.error('Error updating airport:', error1);
  } else {
    console.log('Updated airport:', data1);
  }
  
  console.log('\nUpdating Force Urbania (Outstation)...');
  const { data: data2, error: error2 } = await insforge.database
    .from('vehicle_types')
    .update({ image_url: '/force-urbania-v2.png' })
    .eq('slug', 'force-urbania-outstation')
    .select();
  
  if (error2) {
    console.error('Error updating outstation:', error2);
  } else {
    console.log('Updated outstation:', data2);
  }
  
  // Verify updates
  console.log('\nVerifying updates...');
  const { data: updated, error: verifyError } = await insforge.database
    .from('vehicle_types')
    .select('slug, name, image_url')
    .like('slug', '%force-urbania%')
    .order('slug');
  
  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
    console.log('Updated entries:', JSON.stringify(updated, null, 2));
  }
}

updateImages();
