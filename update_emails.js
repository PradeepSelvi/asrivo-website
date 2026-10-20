// Update team member emails using Supabase REST API
const https = require('https');
const fs = require('fs');

// Load environment variables
const envContent = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const baseUrl = supabaseUrl.replace('https://', '');

console.log('🔄 Updating team member emails...\n');

// Function to make API request
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: path,
      method: method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Function to update email
async function updateTeamMemberEmail(namePattern, newEmail) {
  try {
    // Get team member
    const members = await makeRequest('GET', `/rest/v1/team_members?name=ilike.*${namePattern}*&select=id,name,email`);
    
    if (members && members.length > 0) {
      for (const member of members) {
        console.log(`📧 Found: ${member.name}`);
        console.log(`   Current: ${member.email}`);
        
        // Update email
        await makeRequest('PATCH', `/rest/v1/team_members?id=eq.${member.id}`, { email: newEmail });
        
        console.log(`   ✅ Updated to: ${newEmail}\n`);
      }
    } else {
      console.log(`❌ No member found matching: ${namePattern}\n`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${namePattern}:`, error.message);
  }
}

// Main execution
async function main() {
  await updateTeamMemberEmail('Sivaganesh', 'sivaganesh@asrivotech.in');
  await updateTeamMemberEmail('Karthik', 'karthick@asrivotech.in');
  await updateTeamMemberEmail('Yogesh', 'yogesh@asrivotech.in');
  
  console.log('✅ Email updates completed!');
}

main().catch(console.error);
