const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files
const output = execSync("grep -rl \"toLocaleString('id-ID')\" resources/js", { encoding: 'utf8' });
const files = output.trim().split('\n');

for (const file of files) {
    if (!file) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Pattern 1: Rp {Number(expr).toLocaleString('id-ID')}
    // Or Rp {expr.toLocaleString('id-ID')}
    
    let originalContent = content;
    
    // We want to replace instances of `.toLocaleString('id-ID')` when they are prefixed with `Rp ` or inside `Rp ${...}`
    
    // Replace: Rp {Number(expr).toLocaleString('id-ID')} -> {formatRupiah(expr)}
    content = content.replace(/Rp\s*\{\s*Number\((.*?)\)\.toLocaleString\('id-ID'\)\s*\}/g, '{formatRupiah($1)}');
    
    // Replace: Rp {(expr).toLocaleString('id-ID')} -> {formatRupiah($1)}
    content = content.replace(/Rp\s*\{\s*\((.*?)\)\.toLocaleString\('id-ID'\)\s*\}/g, '{formatRupiah($1)}');
    
    // Replace: Rp {expr.toLocaleString('id-ID')} -> {formatRupiah(expr)}
    content = content.replace(/Rp\s*\{\s*(.*?)\.toLocaleString\('id-ID'\)\s*\}/g, '{formatRupiah($1)}');

    // Inside template strings:
    // Replace: Rp ${Number(expr).toLocaleString('id-ID')} -> ${formatRupiah(expr)}
    content = content.replace(/Rp\s*\$\{\s*Number\((.*?)\)\.toLocaleString\('id-ID'\)\s*\}/g, '${formatRupiah($1)}');

    // Replace: Rp ${expr.toLocaleString('id-ID')} -> ${formatRupiah(expr)}
    content = content.replace(/Rp\s*\$\{\s*(.*?)\.toLocaleString\('id-ID'\)\s*\}/g, '${formatRupiah($1)}');

    if (content !== originalContent) {
        // Ensure formatRupiah is imported if we used it
        if (!content.includes("import { formatRupiah }")) {
            // Check if there are other format imports
            if (content.includes("@/lib/helpers/format")) {
                content = content.replace(/import\s+\{\s*(.*?)\s*\}\s+from\s+['"]@\/lib\/helpers\/format['"]/, 'import { $1, formatRupiah } from \'@/lib/helpers/format\'');
            } else {
                content = "import { formatRupiah } from '@/lib/helpers/format';\n" + content;
            }
        }
        
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
}
