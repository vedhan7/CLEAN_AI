const fs = require('fs');

const rawData = fs.readFileSync('src/data/raw_data.txt', 'utf8');
const lines = rawData.trim().split('\n');

const councillorsJSON = JSON.parse(fs.readFileSync('src/data/councillors.json', 'utf8'));

lines.forEach(line => {
    if (!line.trim()) return;
    // Note: the line might have tabs connecting the values, let's split by tab. 
    // Wait, some spaces might be present, but the copy-paste usually creates tabs.
    const parts = line.split('\t');
    if (parts.length < 2) return;

    const wardId = parseInt(parts[0], 10);
    const councillorName = parts[1].trim();
    // Using other parts if available
    const address = parts[2] ? parts[2].replace(/^"|"$/g, '').trim() : '';
    const phone = parts[3] ? parts[3].trim() : '';
    const email = parts[4] ? parts[4].trim() : '';
    const additionalResp = parts[5] ? parts[5].trim() : '';
    const party = parts[6] ? parts[6].trim() : '';

    const record = councillorsJSON.find(c => c.id === wardId);
    if (record) {
        if (councillorName) record.councillor_name = councillorName;
        if (party) {
            record.councillor_party = party;
        } else {
            // sometimes party is at parts[5] if email is missing and there was an empty tab
            // Let's just do a naive check if the party variable seems plausible
        }

        // Looking closely at the provided text:
        // e.g., 1	TMT. D. SHARMILA	"7/27(2)..."	+91 9344136741		Member - ...	DMK
        // It's tab separated.
        // If the record exists, we will update it.

        // Let's accurately parse based on the 7 tabular columns: 
        // Ward No (0) | Name (1) | Address (2) | Contact (3) | Email (4) | Responsibility (5) | Party (6)
        // However, some lines have missing emails, causing empty tabs.

        let actualParty = party;
        if (!actualParty && party === '' && ['DMK', 'ADMK', 'INDEPENDENT', 'CPM', 'CPI(M)', 'CONGRESS', 'MDMK', 'VCK', 'BJP'].includes(additionalResp)) {
            actualParty = additionalResp;
        }
        if (!actualParty && ['DMK', 'ADMK', 'INDEPENDENT', 'CPM', 'CPI(M)', 'CONGRESS', 'MDMK', 'VCK', 'BJP'].includes(email)) {
            actualParty = email;
        }

        if (councillorName) record.councillor_name = councillorName;
        if (actualParty) record.councillor_party = actualParty;
        if (phone) record.councillor_phone = phone;
    }
});

fs.writeFileSync('src/data/councillors.json', JSON.stringify(councillorsJSON, null, 2));
console.log('Successfully updated councillors.json');
