const fs = require('fs');
const path = require('path');

const extensions = ['.tsx', '.ts'];
const targetDir = './app';

// قائمة التغييرات
const changes = [
    { from: /from\('patients'\)/g, to: "from('clinic_patients')" },
    { from: /from\('appointments'\)/g, to: "from('clinic_appointments')" },
    { from: /from\('medical_records'\)/g, to: "from('clinic_medical_records')" },
    { from: /patients\s*\(/g, to: "clinic_patients (" },
    { from: /appointments\s*\(/g, to: "clinic_appointments (" },
    { from: /medical_records\s*\(/g, to: "clinic_medical_records (" },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const change of changes) {
        const newContent = content.replace(change.from, change.to);
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ تم تعديل: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (extensions.includes(path.extname(file))) {
            processFile(fullPath);
        }
    }
}

console.log('🔄 جاري تعديل الملفات...');
walkDir(targetDir);
console.log('✅ تم الانتهاء!');
