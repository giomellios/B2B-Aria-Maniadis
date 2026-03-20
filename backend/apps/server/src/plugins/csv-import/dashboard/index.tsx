import { api } from '@/vdb/graphql/api.js';
import {
    Button,
    defineDashboardExtension,
    Page,
    PageBlock,
    PageLayout,
    PageTitle,
} from '@vendure/dashboard';
import { Upload } from 'lucide-react';
import { gql } from 'graphql-tag';
import { useRef, useState } from 'react';

interface ImportResult {
    productsCreated: number;
    productsUpdated: number;
    variantsCreated: number;
    errors: string[];
}

function CsvImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        setResult(null);
        setErrorMsg(null);
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setErrorMsg(null);
        setResult(null);

        try {
            // Read file as raw bytes and encode as base64 so the server can
            // decode using the correct charset (cp1253 / UTF-8).
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const csvBase64 = btoa(binary);

            const mutation = gql`
                mutation ImportProductsFromCsv($csvBase64: String!) {
                    importProductsFromCsv(csvBase64: $csvBase64) {
                        productsCreated
                        productsUpdated
                        variantsCreated
                        errors
                    }
                }
            `;

            const json = await api.mutate<{
                importProductsFromCsv: ImportResult;
            }>(mutation, { csvBase64 });

            const data = (json as any)?.importProductsFromCsv;
            if (!data) {
                setErrorMsg('Δεν επεστράφησαν δεδομένα από τον server.');
            } else {
                setResult(data);
            }
        } catch (err: any) {

            const gqlErrors = err?.response?.errors ?? err?.errors;
            if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
                setErrorMsg(gqlErrors.map((e: any) => e.message).join('\n'));
            } else {
                setErrorMsg(err?.message ?? 'Άγνωστο σφάλμα');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setErrorMsg(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Page pageId="csv-import-page">
            <PageTitle>Εισαγωγή Προϊόντων από CSV</PageTitle>
            <PageLayout>
                <PageBlock column="main" blockId="csv-upload-block">
                    <div className="space-y-6 p-2">

                        {/* File picker */}
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="csv-file-input"
                                className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                Επιλογή αρχείου CSV
                            </label>
                            <input
                                id="csv-file-input"
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                className="sr-only"
                                onChange={handleFileChange}
                            />
                            {file && (
                                <span className="text-sm text-muted-foreground">
                                    {file.name}{' '}
                                    <span className="text-xs">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleImport}
                                disabled={!file || loading}
                            >
                                {loading ? 'Εισαγωγή…' : 'Εισαγωγή Προϊόντων'}
                            </Button>
                            {(file || result) && (
                                <Button variant="outline" onClick={handleReset} disabled={loading}>
                                    Επαναφορά
                                </Button>
                            )}
                        </div>

                        {/* Error */}
                        {errorMsg && (
                            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive whitespace-pre-wrap">
                                <p className="font-semibold mb-1">❌ Σφάλμα</p>
                                {errorMsg}
                            </div>
                        )}

                        {/* Success result */}
                        {result && (
                            <div className="space-y-4">
                                <div className="rounded-md border border-border p-4">
                                    <p className="font-semibold mb-3 text-sm">✅ Αποτέλεσμα εισαγωγής</p>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <StatCard
                                            label="Νέα Προϊόντα"
                                            value={result.productsCreated}
                                            color="green"
                                        />
                                        <StatCard
                                            label="Ενημερωμένα"
                                            value={result.productsUpdated}
                                            color="blue"
                                        />
                                        <StatCard
                                            label="Παραλλαγές"
                                            value={result.variantsCreated}
                                            color="purple"
                                        />
                                    </div>
                                </div>

                                {result.errors.length > 0 && (
                                    <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm">
                                        <p className="font-semibold mb-2 text-yellow-700 dark:text-yellow-400">
                                            ⚠ {result.errors.length} σφάλμα(τα) κατά την εισαγωγή:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground max-h-60 overflow-y-auto">
                                            {result.errors.map((e, i) => (
                                                <li key={i}>{e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </PageBlock>
            </PageLayout>
        </Page>
    );
}

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: 'green' | 'blue' | 'purple';
}) {
    const colorClass: Record<string, string> = {
        green: 'text-green-600 dark:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400',
        purple: 'text-purple-600 dark:text-purple-400',
    };
    return (
        <div className="rounded-md border border-border bg-background p-3">
            <p className={`text-2xl font-bold ${colorClass[color]}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
    );
}

defineDashboardExtension({
    routes: [
        {
            path: '/csv-import',
            loader: () => ({ breadcrumb: 'Εισαγωγή CSV' }),
            navMenuItem: {
                id: 'csv-import',
                title: 'CSV',
                sectionId: 'catalog',
                icon: Upload,
            },
            component: CsvImportPage,
        },
    ],
    pageBlocks: [],
    navSections: [],
    actionBarItems: [],
    alerts: [],
    widgets: [],
    customFormComponents: {},
    dataTables: [],
    detailForms: [],
    login: {},
    historyEntries: [],
});
