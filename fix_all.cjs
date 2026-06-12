const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const formatTsPath = 'resources/js/lib/helpers/format.ts';
let formatTsContent = fs.readFileSync(formatTsPath, 'utf8');
if (!formatTsContent.includes('export function formatNumber')) {
    formatTsContent += `\n/**\n * Format angka dengan separator ribuan standar Indonesia (Contoh: "1.500")\n */\nexport function formatNumber(amount: number | string | null | undefined): string {\n    if (amount === null || amount === undefined || amount === '') return '0';\n    const num = typeof amount === 'string' ? parseFloat(amount) : amount;\n    if (isNaN(num)) return '0';\n    return num.toLocaleString('id-ID');\n}\n`;
    fs.writeFileSync(formatTsPath, formatTsContent);
}

const output = execSync("grep -rn \"toLocaleString\" resources/js", { encoding: 'utf8' });
const lines = output.trim().split('\n');

for (const line of lines) {
    if (!line || line.includes('format.ts')) continue;
    const parts = line.split(':');
    const file = parts[0];
    
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // We manually replace based on the file and context
    
    // POS Cart Sidebar inputs (money)
    if (file.includes('PosCartSidebar.tsx')) {
        content = content.replace(/Number\(splitCashInput\)\.toLocaleString\('id-ID'\)/g, "formatNumber(splitCashInput)");
        content = content.replace(/Number\(splitTransferInput\)\.toLocaleString\('id-ID'\)/g, "formatNumber(splitTransferInput)");
        content = content.replace(/amt\.toLocaleString\('id-ID'\)/g, "formatNumber(amt)");
        content = content.replace(/parseFloat\(pr\.value\)\.toLocaleString\(\)/g, "formatNumber(pr.value)");
    }
    
    // POS Hooks (Money & Points)
    if (file.includes('usePosCart.ts')) {
        content = content.replace(/numericValue\.toLocaleString\('id-ID'\)/g, "formatNumber(numericValue)");
        content = content.replace(/cartSubtotal\.toLocaleString\('id-ID'\)/g, "formatNumber(cartSubtotal)");
        content = content.replace(/parsed\.toLocaleString\('id-ID'\)/g, "formatNumber(parsed)");
        content = content.replace(/maxPoints\.toLocaleString\('id-ID'\)/g, "formatNumber(maxPoints)");
        content = content.replace(/amount\.toLocaleString\('id-ID'\)/g, "formatNumber(amount)");
    }
    
    // Counts & Points
    content = content.replace(/totalResults\.toLocaleString\('id-ID'\)/g, "formatNumber(totalResults)");
    content = content.replace(/total\?\.toLocaleString\('id-ID'\)/g, "formatNumber(total)");
    content = content.replace(/total \? total\.toLocaleString\('id-ID'\) : 0/g, "formatNumber(total)");
    content = content.replace(/total\.toLocaleString\('id-ID'\)/g, "formatNumber(total)");
    content = content.replace(/filteredCount\.toLocaleString\('id-ID'\)/g, "formatNumber(filteredCount)");
    content = content.replace(/length\.toLocaleString\('id-ID'\)/g, "formatNumber(length)");
    content = content.replace(/data\.total\.toLocaleString\('id-ID'\)/g, "formatNumber(data.total)");
    content = content.replace(/Math\.abs\(qty\)\.toLocaleString\('id-ID'\)/g, "formatNumber(Math.abs(qty))");
    content = content.replace(/stock\.toLocaleString\('id-ID'\)/g, "formatNumber(stock)");
    content = content.replace(/\(activeMember\?\.points \|\| 0\)\.toLocaleString\('id-ID'\)/g, "formatNumber(activeMember?.points)");
    content = content.replace(/\(stats\.total \|\| 0\)\.toLocaleString\('id-ID'\)/g, "formatNumber(stats.total)");
    content = content.replace(/\(stats\.points \|\| 0\)\.toLocaleString\('id-ID'\)/g, "formatNumber(stats.points)");
    content = content.replace(/\(m\.points \|\| 0\)\.toLocaleString\('id-ID'\)/g, "formatNumber(m.points)");
    content = content.replace(/Number\(product\.current_stock \?\? 0\)\.toLocaleString\('id-ID'\)/g, "formatNumber(product.current_stock)");
    content = content.replace(/Number\(selectedProduct\.current_stock \?\? 0\)\.toLocaleString\('id-ID'\)/g, "formatNumber(selectedProduct.current_stock)");
    content = content.replace(/v\.toLocaleString\('id-ID'\)/g, "formatNumber(v)");

    // Date replacements (if simple)
    content = content.replace(/new Date\((.*?)\)\.toLocaleString\('id-ID'\)/g, "formatDateTime($1)");
    content = content.replace(/new Date\((.*?)\)\.toLocaleString\('id-ID', \{[^}]+\}\)/g, "formatDateTime($1)");
    
    // Specific edge cases
    content = content.replace(/item\.base_cost\.toLocaleString\('id-ID'\)/g, "formatNumber(item.base_cost)");
    content = content.replace(/data\.total_discount\.toLocaleString\('id-ID'\)/g, "formatNumber(data.total_discount)");

    if (content !== originalContent) {
        // Add imports if needed
        let importsToAdd = [];
        if (content.includes('formatNumber(')) importsToAdd.push('formatNumber');
        if (content.includes('formatDateTime(')) importsToAdd.push('formatDateTime');
        if (content.includes('formatRupiah(')) importsToAdd.push('formatRupiah');
        
        if (importsToAdd.length > 0) {
            if (content.includes("@/lib/helpers/format")) {
                importsToAdd.forEach(imp => {
                    if (!content.includes(` ${imp}`)) {
                        content = content.replace(/import\s+\{\s*(.*?)\s*\}\s+from\s+['"]@\/lib\/helpers\/format['"]/, `import { $1, ${imp} } from '@/lib/helpers/format'`);
                    }
                });
            } else {
                content = `import { ${importsToAdd.join(', ')} } from '@/lib/helpers/format';\n` + content;
            }
        }
        fs.writeFileSync(file, content);
        console.log(`Fixed ${file}`);
    }
}
