import {
    api,
    Button,
    DataTableBulkActionItem,
    defineDashboardExtension,
    PermissionGuard,
} from '@vendure/dashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ManuallyVerifyCustomerDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'ManuallyVerifyCustomer' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'manuallyVerifyCustomer' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as any;

function ApproveCustomerButton({ context }: { context: any }) {
    const queryClient = useQueryClient();
    const customer = context.entity;

    const { mutate, isPending } = useMutation({
        mutationFn: (variables: { id: string }) =>
            api.mutate(ManuallyVerifyCustomerDocument, variables),
        onSuccess: () => {
            toast.success('Customer approved successfully');
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Failed to approve customer');
        },
    });

    if (!customer || customer.user?.verified) {
        return null;
    }

    return (
        <PermissionGuard requires={['UpdateCustomer']}>
            <Button
                type="button"
                variant="default"
                onClick={() => mutate({ id: customer.id })}
                disabled={isPending}
            >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isPending ? 'Approving...' : 'Approve Customer'}
            </Button>
        </PermissionGuard>
    );
}

function ApproveBulkAction({ selection }: { selection: any[] }) {
    const queryClient = useQueryClient();
    const unapproved = selection.filter(c => !c.user?.verified);

    const { mutate, isPending } = useMutation({
        mutationFn: async (ids: string[]) => {
            for (const id of ids) {
                await api.mutate(ManuallyVerifyCustomerDocument, { id });
            }
        },
        onSuccess: () => {
            toast.success(`${unapproved.length} customer(s) approved`);
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error('Failed to approve customers');
        },
    });

    if (unapproved.length === 0) {
        return null;
    }

    return (
        <DataTableBulkActionItem
            onClick={() => mutate(unapproved.map(c => c.id))}
            label={isPending ? 'Approving...' : `Approve (${unapproved.length})`}
            icon={CheckCircle}
        />
    );
}

defineDashboardExtension({
    actionBarItems: [
        {
            pageId: 'customer-detail',
            component: ({ context }) => <ApproveCustomerButton context={context} />,
        },
    ],
    dataTables: [
        {
            pageId: 'customer-list',
            bulkActions: [
                {
                    component: props => <ApproveBulkAction selection={props.selection} />,
                },
            ],
        },
    ],
});
