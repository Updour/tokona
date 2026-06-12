const fs = require('fs');
const files = [
    'resources/js/pages/hris/salaries/components/SalariesTable.tsx',
    'resources/js/pages/hris/payrolls/components/GeneratePayrollDialog.tsx',
    'resources/js/pages/hris/payrolls/components/PayrollsTable.tsx',
    'resources/js/pages/hris/payrolls/Index.tsx',
    'resources/js/pages/hris/salaries/Index.tsx',
    'resources/js/pages/finance/accounting/journals/Index.tsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if formatRupiah is actually imported
    const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/helpers\/format['"]/);
    
    if (importMatch) {
        if (!importMatch[1].includes('formatRupiah')) {
            content = content.replace(importMatch[0], importMatch[0].replace(importMatch[1], importMatch[1] + ', formatRupiah '));
            fs.writeFileSync(file, content);
            console.log(`Added formatRupiah import to ${file}`);
        }
    } else {
        content = "import { formatRupiah } from '@/lib/helpers/format';\n" + content;
        fs.writeFileSync(file, content);
        console.log(`Added new formatRupiah import to ${file}`);
    }
}
