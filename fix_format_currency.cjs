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
    
    // Remove the definition of formatCurrency
    content = content.replace(/const formatCurrency = \(amount: number \| string\) => {[\s\S]*?}\)\.format\(Number\(amount\)\);\n    };\n/g, '');
    
    // Remove it from props/interfaces
    content = content.replace(/\s*formatCurrency: \(amount: any\) => string;/g, '');
    content = content.replace(/\s*formatCurrency: \(amount: number \| string\) => string;/g, '');
    content = content.replace(/, formatCurrency/g, '');
    content = content.replace(/formatCurrency,/g, '');
    content = content.replace(/formatCurrency={formatCurrency}/g, '');
    
    // Replace calls to formatCurrency with formatRupiah
    content = content.replace(/formatCurrency\(/g, 'formatRupiah(');
    
    // Add import if not present
    if (content.includes('formatRupiah(')) {
        if (content.includes("@/lib/helpers/format")) {
            if (!content.includes('formatRupiah')) {
                content = content.replace(/import\s+\{\s*(.*?)\s*\}\s+from\s+['"]@\/lib\/helpers\/format['"]/, "import { $1, formatRupiah } from '@/lib/helpers/format'");
            }
        } else {
            content = "import { formatRupiah } from '@/lib/helpers/format';\n" + content;
        }
    }
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
}
