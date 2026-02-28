import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const data = require('../src/data/councillors.json');

const esc = (s) => (s || '').replace(/'/g, "''");

const rows = data.map(w =>
    `(${w.id}, '${esc(w.name)}', '${esc(w.zone)}', '${esc(w.councillor_name)}', '${esc(w.councillor_party)}', '${esc(w.councillor_phone)}', '${esc(w.councillor_email)}', ${w.population || 0}, ${w.area_sqkm || 0}, ${w.door_to_door_pct || 37}, ${w.segregation_pct || 26}, ${w.processing_pct || 4}, ${w.toilet_cleanliness_pct || 3}, ${w.dumpsite_remediation_pct || 25})`
);

let sql = `-- Ward data import for Madurai Corporation (${data.length} wards)
-- Paste this into Supabase SQL Editor and click Run.

INSERT INTO public.wards (id, name, zone, councillor_name, councillor_party, councillor_phone, councillor_email, population, area_sqkm, door_to_door_pct, segregation_pct, processing_pct, toilet_cleanliness_pct, dumpsite_remediation_pct) VALUES
${rows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, zone=EXCLUDED.zone, councillor_name=EXCLUDED.councillor_name,
  councillor_party=EXCLUDED.councillor_party, councillor_phone=EXCLUDED.councillor_phone,
  councillor_email=EXCLUDED.councillor_email, population=EXCLUDED.population,
  area_sqkm=EXCLUDED.area_sqkm, door_to_door_pct=EXCLUDED.door_to_door_pct,
  segregation_pct=EXCLUDED.segregation_pct, processing_pct=EXCLUDED.processing_pct,
  toilet_cleanliness_pct=EXCLUDED.toilet_cleanliness_pct,
  dumpsite_remediation_pct=EXCLUDED.dumpsite_remediation_pct;

-- Reset the serial sequence to be after the last ward
SELECT setval('wards_id_seq', (SELECT MAX(id) FROM public.wards));
`;

const outPath = path.join(__dirname, '..', 'supabase', 'migrations', 'seed_wards.sql');
fs.writeFileSync(outPath, sql);
console.log(`Generated ${outPath} with ${data.length} ward records.`);
