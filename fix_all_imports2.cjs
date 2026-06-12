const fs = require('fs');
const { execSync } = require('child_process');

try {
    execSync('npx tsc --project tsconfig.json --noEmit', { stdio: 'pipe' });
} catch (e) {
    const output = e.stdout.toString();
    const lines = output.split('\n');
    const filesToFix = new Set();
    
    for (const line of lines) {
        if (line.includes('error TS2304: Cannot find name \'formatNumber\'') || line.includes('error TS2304: Cannot find name \'formatDateTime\'')) {
            const match = line.match(/(resources\/js\/.*?\.tsx?)/);
            if (match) filesToFix.add(match[1]);
        }
    }
    
    console.log(`Found ${filesToFix.size} files with missing imports.`);
    
    for (const file of filesToFix) {
        let content = fs.readFileSync(file, 'utf8');
        
        let importsToAdd = [];
        if (content.includes('formatNumber(') && !content.includes('formatNumber }')) importsToAdd.push('formatNumber');
        if (content.includes('formatDateTime(') && !content.includes('formatDateTime }')) importsToAdd.push('formatDateTime');
        
        if (importsToAdd.length > 0) {
            const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/helpers\/format['"]/);
            if (importMatch) {
                let toAdd = importsToAdd.filter(i => !importMatch[1].includes(i));
                if (toAdd.length > 0) {
                    content = content.replace(importMatch[0], importMatch[0].replace(importMatch[1], importMatch[1] + ', ' + toAdd.join(', ')));
                }
            } else {
                content = `import { ${importsToAdd.join(', ')} } from '@/lib/helpers/format';\n` + content;
            }
            fs.writeFileSync(file, content);
            console.log(`Fixed imports in ${file}`);
        }
    }
}
