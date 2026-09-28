import {
    api,
    Button,
    defineDashboardExtension,
    Page,
    PageBlock,
    PageLayout,
    PageTitle,
    useMutation,
    useQuery,
} from '@vendure/dashboard';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { graphql } from '@/gql';

const startImportDocument = graphql(`
    mutation StartCsvProductImport($file: Upload!) {
        startCsvProductImport(file: $file) {
            id
            state
        }
    }
`);

const importJobDocument = graphql(`
    query CsvProductImportJob($id: ID!) {
        csvProductImportJob(id: $id) {
            id
            state
            progress
            error
            result {
                productsCreated
                productsUpdated
                variantsCreated
                variantsUpdated
                errors
            }
        }
    }
`);

const RUNNING_STATES = ['PENDING', 'RUNNING', 'RETRYING'];

function CsvImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startImport = useMutation({
        mutationFn: (selected: File) => api.mutate(startImportDocument, { file: selected }),
        onSuccess: data => setJobId(String(data.startCsvProductImport.id)),
    });

    const jobQuery = useQuery({
        queryKey: ['csvProductImportJob', jobId],
        queryFn: () => api.query(importJobDocument, { id: jobId as string }),
        enabled: !!jobId,
        // Poll every 1.5 s until the worker has finished the job.
        refetchInterval: query => {
            const state = query.state.data?.csvProductImportJob?.state;
            return !state || RUNNING_STATES.includes(state) ? 1500 : false;
        },
    });

    const job = jobQuery.data?.csvProductImportJob;
    const isRunning = startImport.isPending || (!!jobId && (!job || RUNNING_STATES.includes(job.state)));
    const result = job?.state === 'COMPLETED' ? job.result : null;
    const errorMsg =
        (startImport.error instanceof Error ? startImport.error.message : null) ??
        (job?.state === 'FAILED' ? (job.error ?? 'Η εισαγωγή απέτυχε.') : null) ??
        (jobId && jobQuery.isFetched && !job ? 'Η εργασία εισαγωγής δεν βρέθηκε.' : null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
        setJobId(null);
        startImport.reset();
    };

    const handleReset = () => {
        setFile(null);
        setJobId(null);
        startImport.reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Page pageId="csv-import-page">
            <PageTitle>Εισαγωγή Προϊόντων από CSV</PageTitle>
            <PageLayout>
                <PageBlock column="main" blockId="csv-upload-block">
                    <div className="space-y-6 p-2">
                        <p className="text-sm text-muted-foreground">
                            Νέα προϊόντα δημιουργούνται· για υπάρχοντα προϊόντα ενημερώνονται τιμές και απόθεμα
                            των παραλλαγών (ανά SKU) και προστίθενται οι παραλλαγές που λείπουν. Η εισαγωγή
                            εκτελείται στο παρασκήνιο (worker).
                        </p>

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
                                    <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => file && startImport.mutate(file)} disabled={!file || isRunning}>
                                {isRunning ? 'Εισαγωγή…' : 'Εισαγωγή Προϊόντων'}
                            </Button>
                            {(file || jobId) && (
                                <Button variant="outline" onClick={handleReset} disabled={isRunning}>
                                    Επαναφορά
                                </Button>
                            )}
                        </div>

                        {jobId && isRunning && (
                            <div className="space-y-1">
                                <div className="h-2 w-full overflow-hidden rounded bg-muted">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${Math.round(job?.progress ?? 0)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {job?.state === 'PENDING'
                                        ? 'Σε αναμονή για τον worker…'
                                        : `${Math.round(job?.progress ?? 0)}%`}
                                </p>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive whitespace-pre-wrap">
                                <p className="font-semibold mb-1">❌ Σφάλμα</p>
                                {errorMsg}
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4">
                                <div className="rounded-md border border-border p-4">
                                    <p className="font-semibold mb-3 text-sm">✅ Αποτέλεσμα εισαγωγής</p>
                                    <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                                        <StatCard label="Νέα Προϊόντα" value={result.productsCreated} color="green" />
                                        <StatCard label="Ενημερωμένα Προϊόντα" value={result.productsUpdated} color="blue" />
                                        <StatCard label="Νέες Παραλλαγές" value={result.variantsCreated} color="purple" />
                                        <StatCard
                                            label="Ενημερωμένες Παραλλαγές"
                                            value={result.variantsUpdated}
                                            color="blue"
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
                requiresPermission: ['ImportProductsFromCsv'],
            },
            component: CsvImportPage,
        },
    ],
});
