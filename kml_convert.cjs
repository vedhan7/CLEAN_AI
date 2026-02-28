/**
 * KML to GeoJSON converter for Madurai ward boundaries
 */
const fs = require('fs');
const path = require('path');

const kmlPath = path.join(__dirname, 'madurai.kml');
const outputPath = path.join(__dirname, 'public', 'madurai-wards.geojson');

const kml = fs.readFileSync(kmlPath, 'utf-8');

const placemarks = [];
const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
let match;

while ((match = placemarkRegex.exec(kml)) !== null) {
    const block = match[1];

    const getSimpleData = (name) => {
        const escapedName = name.replace(/[()]/g, '\\$&');
        const re = new RegExp('<SimpleData name="' + escapedName + '">(.*?)<\\/SimpleData>');
        const m = block.match(re);
        return m ? m[1].trim() : null;
    };

    const wardNumber = getSimpleData('ward_lgd_name');
    const zone = getSimpleData('zone');
    const sourcewardcode = getSimpleData('sourcewardcode');
    const objectid = getSimpleData('objectid');

    const coordsRegex2 = /<coordinates>([\s\S]*?)<\/coordinates>/g;
    const polygons = [];
    let coordMatch;

    while ((coordMatch = coordsRegex2.exec(block)) !== null) {
        const coordStr = coordMatch[1].trim();
        const ring = coordStr.split(/\s+/).map(pt => {
            const parts = pt.split(',');
            return [parseFloat(parts[0]), parseFloat(parts[1])];
        });
        polygons.push([ring]);
    }

    if (wardNumber && polygons.length > 0) {
        const geometry = polygons.length === 1
            ? { type: 'Polygon', coordinates: polygons[0] }
            : { type: 'MultiPolygon', coordinates: polygons };

        placemarks.push({
            type: 'Feature',
            properties: {
                id: parseInt(wardNumber, 10),
                name: 'Ward ' + wardNumber,
                ward_number: parseInt(wardNumber, 10),
                zone: zone || '',
                sourcewardcode: sourcewardcode || '',
                objectid: objectid ? parseInt(objectid, 10) : null
            },
            geometry
        });
    }
}

placemarks.sort((a, b) => a.properties.id - b.properties.id);

const geojson = {
    type: 'FeatureCollection',
    features: placemarks
};

fs.writeFileSync(outputPath, JSON.stringify(geojson));

console.log('Converted ' + placemarks.length + ' wards to GeoJSON');
console.log('Ward numbers: ' + placemarks.map(f => f.properties.id).join(', '));
console.log('Output: ' + outputPath);
