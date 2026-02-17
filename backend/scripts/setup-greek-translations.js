#!/usr/bin/env node

/**
 * This script sets up Greek translations for the Vendure dashboard.
 * It runs automatically after npm install via the postinstall hook.
 */

const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.join(__dirname, '..');
const DASHBOARD_PKG = path.join(BACKEND_ROOT, 'node_modules/@vendure/dashboard');

// Source files in your project
const SOURCE_LINGUI_CONFIG = path.join(BACKEND_ROOT, 'lingui.config.js');
const SOURCE_EL_PO = path.join(BACKEND_ROOT, 'apps/server/src/plugins/greek-translations/dashboard/el.po');

// Destination in Vendure dashboard package
const DEST_LINGUI_CONFIG = path.join(DASHBOARD_PKG, 'lingui.config.js');
const DEST_EL_PO = path.join(DASHBOARD_PKG, 'src/i18n/locales/el.po');

function setupGreekTranslations() {
    // Check if dashboard package exists
    if (!fs.existsSync(DASHBOARD_PKG)) {
        console.log('@vendure/dashboard not found. Skipping Greek translation setup.');
        return;
    }

    let filesUpdated = 0;

    // Copy lingui.config.js
    if (fs.existsSync(SOURCE_LINGUI_CONFIG)) {
        fs.copyFileSync(SOURCE_LINGUI_CONFIG, DEST_LINGUI_CONFIG);
        console.log('Copied lingui.config.js (Greek enabled)');
        filesUpdated++;
    } else {
        console.warn('Source lingui.config.js not found at:', SOURCE_LINGUI_CONFIG);
    }

    // Copy el.po translation file
    if (fs.existsSync(SOURCE_EL_PO)) {
        // Ensure destination directory exists
        const destDir = path.dirname(DEST_EL_PO);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(SOURCE_EL_PO, DEST_EL_PO);
        console.log('Copied el.po (Greek translations)');
        filesUpdated++;
    } else {
        console.warn('Source el.po not found at:', SOURCE_EL_PO);
    }

    if (filesUpdated === 2) {
        console.log('🇬🇷 Greek translations configured successfully!');
    } else if (filesUpdated === 0) {
        console.error('Failed to setup Greek translations - source files not found');
    }
}

setupGreekTranslations();
