const { execSync } = require('node:child_process');

function hasPatchPackage() {
    try {
        require.resolve('patch-package/package.json');
        return true;
    } catch {
        return false;
    }
}

if (hasPatchPackage()) {
    console.log('Applying patches with patch-package...');
    execSync('npx --no-install patch-package', { stdio: 'inherit' });
} else {
    console.log('patch-package is not installed in this environment. Skipping patch apply.');
}

console.log('Running Greek translations setup...');
execSync('node scripts/setup-greek-translations.js', { stdio: 'inherit' });
